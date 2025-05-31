import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma/prisma.service';
import { LoginInput } from './dto/login.input';
import { LoginResponse } from './dto/login-response.output';

import { UsersService } from '../users/users.service';
import { AuthResponse } from './dto/auth-response.output';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      // Actualizar último login
      await this.usersService.updateLastLogin(user.id);
      return user;
    }
    return null;
  }

  async login(loginInput: LoginInput): Promise<LoginResponse> {
    const { email, password } = loginInput;

    // Buscar usuario por email
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol.nombre,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        password: '', // Empty password for security
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        activo: user.activo,
        emailVerified: user.emailVerified,
        ultimoLogin: user.ultimoLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        rolId: user.rolId,
        rol: {
          id: user.rol.id,
          nombre: user.rol.nombre,
          descripcion: user.rol.descripcion,
          permisos: user.rol.permisos,
          activo: user.rol.activo,
          createdAt: user.rol.createdAt,
          updatedAt: user.rol.updatedAt,
        },
      },
      tokenType: 'Bearer',
      expiresIn: '1d',
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }

  async validateUserPayload(payload: any) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { rol: true },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      password: '', // Empty password for security
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      activo: user.activo,
      emailVerified: user.emailVerified,
      ultimoLogin: user.ultimoLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      rolId: user.rolId,
      rol: {
        id: user.rol.id,
        nombre: user.rol.nombre,
        descripcion: user.rol.descripcion,
        permisos: user.rol.permisos,
        activo: user.rol.activo,
        createdAt: user.rol.createdAt,
        updatedAt: user.rol.updatedAt,
      },
    };
  }
} 