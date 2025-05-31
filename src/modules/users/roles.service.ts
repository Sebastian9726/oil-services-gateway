import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateRolInput } from './dto/create-rol.input';
import { UpdateRolInput } from './dto/update-rol.input';
import { Rol } from './entities/rol.entity';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRolInput: CreateRolInput): Promise<Rol> {
    // Verificar si el nombre ya existe
    const existingRol = await this.prisma.rol.findUnique({
      where: { nombre: createRolInput.nombre },
    });

    if (existingRol) {
      throw new ConflictException('El nombre del rol ya está en uso');
    }

    const rol = await this.prisma.rol.create({
      data: createRolInput,
    });

    return rol as Rol;
  }

  async findAll(): Promise<Rol[]> {
    const roles = await this.prisma.rol.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return roles as Rol[];
  }

  async findById(id: string): Promise<Rol | null> {
    const rol = await this.prisma.rol.findUnique({
      where: { id },
    });

    return rol as Rol | null;
  }

  async findByName(nombre: string): Promise<Rol | null> {
    const rol = await this.prisma.rol.findUnique({
      where: { nombre },
    });

    return rol as Rol | null;
  }

  async update(id: string, updateRolInput: UpdateRolInput): Promise<Rol> {
    const existingRol = await this.findById(id);
    
    if (!existingRol) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Si se está actualizando el nombre, verificar que no exista
    if (updateRolInput.nombre && updateRolInput.nombre !== existingRol.nombre) {
      const nombreExists = await this.prisma.rol.findUnique({
        where: { nombre: updateRolInput.nombre },
      });

      if (nombreExists) {
        throw new ConflictException('El nombre del rol ya está en uso');
      }
    }

    const rol = await this.prisma.rol.update({
      where: { id },
      data: updateRolInput,
    });

    return rol as Rol;
  }

  async remove(id: string): Promise<Rol> {
    const existingRol = await this.findById(id);
    
    if (!existingRol) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Verificar si hay usuarios con este rol
    const usersWithRole = await this.prisma.usuario.count({
      where: { rolId: id },
    });

    if (usersWithRole > 0) {
      throw new ConflictException('No se puede eliminar el rol porque tiene usuarios asignados');
    }

    const rol = await this.prisma.rol.delete({
      where: { id },
    });

    return rol as Rol;
  }

  async toggleRolStatus(id: string): Promise<Rol> {
    const rol = await this.findById(id);
    
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    const updatedRol = await this.prisma.rol.update({
      where: { id },
      data: { activo: !rol.activo },
    });

    return updatedRol as Rol;
  }

  async getActiveRoles(): Promise<Rol[]> {
    const roles = await this.prisma.rol.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });

    return roles as Rol[];
  }
} 