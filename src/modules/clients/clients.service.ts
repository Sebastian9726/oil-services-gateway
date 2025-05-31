import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateClienteInput } from './dto/create-cliente.input';
import { UpdateClienteInput } from './dto/update-cliente.input';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClienteInput: CreateClienteInput): Promise<Cliente> {
    // Verificar si el número de documento ya existe
    const existingClient = await this.prisma.cliente.findUnique({
      where: { numeroDocumento: createClienteInput.numeroDocumento },
    });

    if (existingClient) {
      throw new ConflictException('El número de documento ya está registrado');
    }

    // Si hay email, verificar que no exista
    if (createClienteInput.email) {
      const emailExists = await this.prisma.cliente.findFirst({
        where: { email: createClienteInput.email },
      });

      if (emailExists) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const cliente = await this.prisma.cliente.create({
      data: createClienteInput,
    });

    return cliente as Cliente;
  }

  async findAll(): Promise<Cliente[]> {
    const clientes = await this.prisma.cliente.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return clientes as Cliente[];
  }

  async findById(id: string): Promise<Cliente | null> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
    });

    return cliente as Cliente | null;
  }

  async findByDocument(numeroDocumento: string): Promise<Cliente | null> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { numeroDocumento },
    });

    return cliente as Cliente | null;
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { email },
    });

    return cliente as Cliente | null;
  }

  async findActive(): Promise<Cliente[]> {
    const clientes = await this.prisma.cliente.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });

    return clientes as Cliente[];
  }

  async searchClients(searchTerm: string): Promise<Cliente[]> {
    const clientes = await this.prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: searchTerm, mode: 'insensitive' } },
          { apellido: { contains: searchTerm, mode: 'insensitive' } },
          { numeroDocumento: { contains: searchTerm } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: { nombre: 'asc' },
    });

    return clientes as Cliente[];
  }

  async update(id: string, updateClienteInput: UpdateClienteInput): Promise<Cliente> {
    const existingClient = await this.findById(id);
    
    if (!existingClient) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Si se está actualizando el número de documento, verificar que no exista
    if (updateClienteInput.numeroDocumento && updateClienteInput.numeroDocumento !== existingClient.numeroDocumento) {
      const documentExists = await this.prisma.cliente.findUnique({
        where: { numeroDocumento: updateClienteInput.numeroDocumento },
      });

      if (documentExists) {
        throw new ConflictException('El número de documento ya está registrado');
      }
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateClienteInput.email && updateClienteInput.email !== existingClient.email) {
      const emailExists = await this.prisma.cliente.findFirst({
        where: { 
          email: updateClienteInput.email,
          NOT: { id: id }
        },
      });

      if (emailExists) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const cliente = await this.prisma.cliente.update({
      where: { id },
      data: updateClienteInput,
    });

    return cliente as Cliente;
  }

  async remove(id: string): Promise<Cliente> {
    const existingClient = await this.findById(id);
    
    if (!existingClient) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Verificar si tiene ventas asociadas
    const salesCount = await this.prisma.venta.count({
      where: { clienteId: id },
    });

    if (salesCount > 0) {
      throw new ConflictException('No se puede eliminar el cliente porque tiene ventas asociadas');
    }

    const cliente = await this.prisma.cliente.delete({
      where: { id },
    });

    return cliente as Cliente;
  }

  async toggleClientStatus(id: string): Promise<Cliente> {
    const cliente = await this.findById(id);
    
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const updatedClient = await this.prisma.cliente.update({
      where: { id },
      data: { activo: !cliente.activo },
    });

    return updatedClient as Cliente;
  }

  async getClientStats() {
    const totalClients = await this.prisma.cliente.count();
    const activeClients = await this.prisma.cliente.count({
      where: { activo: true },
    });
    const inactiveClients = totalClients - activeClients;

    // Clientes con más ventas
    const topClients = await this.prisma.cliente.findMany({
      include: {
        _count: {
          select: {
            ventas: true,
          },
        },
      },
      orderBy: {
        ventas: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return {
      totalClients,
      activeClients,
      inactiveClients,
      topClients: topClients.map(client => ({
        ...client,
        salesCount: client._count.ventas,
      })),
    };
  }
} 