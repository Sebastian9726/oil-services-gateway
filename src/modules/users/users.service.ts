import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { FilterUsersInput } from './dto/filter-users.input';
import { User } from './entities/user.entity';
import { UserListResponse } from './entities/user-list-response.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createUserInput.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está en uso');
    }

    // Verificar si el username ya existe
    const existingUsername = await this.prisma.usuario.findUnique({
      where: { username: createUserInput.username },
    });

    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Verificar que el rol existe
    const rol = await this.prisma.rol.findUnique({
      where: { id: createUserInput.rolId },
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserInput.password, 12);

    const user = await this.prisma.usuario.create({
      data: {
        ...createUserInput,
        password: hashedPassword,
      },
      include: {
        rol: true,
      },
    });

    return user as User;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.usuario.findMany({
      include: {
        rol: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users as User[];
  }

  async findAllWithFilters(
    filters?: FilterUsersInput,
    page: number = 1,
    limit: number = 10,
  ): Promise<UserListResponse> {
    // Si limit es -1, obtener todos los resultados sin paginación
    const usesPagination = limit !== -1;
    const skip = usesPagination ? (page - 1) * limit : 0;
    
    // Construir las condiciones de filtrado
    const where: any = {};

    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    }

    if (filters?.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified;
    }

    if (filters?.roleName) {
      where.rol = {
        nombre: filters.roleName,
      };
    }

    if (filters?.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { apellido: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Contar total de registros
    const total = await this.prisma.usuario.count({ where });

    // Configurar la query
    const queryOptions: any = {
      where,
      include: {
        rol: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    };

    // Solo agregar skip y take si se usa paginación
    if (usesPagination) {
      queryOptions.skip = skip;
      queryOptions.take = limit;
    }

    // Obtener usuarios con filtros
    const users = await this.prisma.usuario.findMany(queryOptions);

    const totalPages = usesPagination ? Math.ceil(total / limit) : 1;
    const actualLimit = usesPagination ? limit : total;

    return {
      users: users as User[],
      total,
      page: usesPagination ? page : 1,
      limit: actualLimit,
      totalPages,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        rol: true,
      },
    });

    return user as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        rol: true,
      },
    });

    return user as User | null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.usuario.findUnique({
      where: { username },
      include: {
        rol: true,
      },
    });

    return user as User | null;
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const existingUser = await this.findById(id);
    
    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateUserInput.email && updateUserInput.email !== existingUser.email) {
      const emailExists = await this.prisma.usuario.findUnique({
        where: { email: updateUserInput.email },
      });

      if (emailExists) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Si se está actualizando el username, verificar que no exista
    if (updateUserInput.username && updateUserInput.username !== existingUser.username) {
      const usernameExists = await this.prisma.usuario.findUnique({
        where: { username: updateUserInput.username },
      });

      if (usernameExists) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
    }

    const updateData: any = { ...updateUserInput };

    // Si se está actualizando la contraseña, hashearla
    if (updateUserInput.password) {
      updateData.password = await bcrypt.hash(updateUserInput.password, 12);
    }

    const user = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
      include: {
        rol: true,
      },
    });

    return user as User;
  }

  async remove(id: string): Promise<User> {
    const existingUser = await this.findById(id);
    
    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // En lugar de eliminar, marcar como inactivo
    const user = await this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
      include: {
        rol: true,
      },
    });

    return user as User;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id },
      data: { ultimoLogin: new Date() },
    });
  }

  async changePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await this.prisma.usuario.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return true;
  }

  async toggleUserStatus(id: string): Promise<User> {
    const user = await this.findById(id);
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id },
      data: { activo: !user.activo },
      include: {
        rol: true,
      },
    });

    return updatedUser as User;
  }

  async findUsersByRole(roleName: string): Promise<User[]> {
    const users = await this.prisma.usuario.findMany({
      where: {
        rol: {
          nombre: roleName,
        },
        activo: true, // Solo usuarios activos por defecto
      },
      include: {
        rol: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users as User[];
  }
} 