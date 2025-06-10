import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateSurtidorInput } from './dto/create-surtidor.input';
import { UpdateSurtidorInput } from './dto/update-surtidor.input';
import { Surtidor, SurtidorListResponse } from './entities/surtidor.entity';
import { MangueraSurtidor } from './entities/manguera-surtidor.entity';

@Injectable()
export class SurtidoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSurtidorInput: CreateSurtidorInput): Promise<Surtidor> {
    try {
      // Verificar si el número de surtidor ya existe
      const existingSurtidor = await this.prisma.surtidor.findUnique({
        where: { numero: createSurtidorInput.numero },
      });

      if (existingSurtidor) {
        throw new ConflictException(`Ya existe un surtidor con el número: ${createSurtidorInput.numero}`);
      }

      // Validar que el número de mangueras coincida con las mangueras proporcionadas
      if (createSurtidorInput.mangueras.length !== createSurtidorInput.cantidadMangueras) {
        throw new BadRequestException(
          `El número de mangueras (${createSurtidorInput.mangueras.length}) no coincide con la cantidad especificada (${createSurtidorInput.cantidadMangueras})`
        );
      }

      // Verificar que los productos existan
      const productIds = createSurtidorInput.mangueras.map(m => m.productoId);
      const productos = await this.prisma.producto.findMany({
        where: { id: { in: productIds } },
      });

      if (productos.length !== productIds.length) {
        const foundIds = productos.map(p => p.id);
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`Productos no encontrados: ${missingIds.join(', ')}`);
      }

      // Crear surtidor con mangueras
      const surtidor = await this.prisma.surtidor.create({
        data: {
          numero: createSurtidorInput.numero,
          nombre: createSurtidorInput.nombre,
          descripcion: createSurtidorInput.descripcion,
          ubicacion: createSurtidorInput.ubicacion,
          cantidadMangueras: createSurtidorInput.cantidadMangueras,
          activo: createSurtidorInput.activo ?? true,
          fechaInstalacion: createSurtidorInput.fechaInstalacion,
          fechaMantenimiento: createSurtidorInput.fechaMantenimiento,
          observaciones: createSurtidorInput.observaciones,
          mangueras: {
            create: createSurtidorInput.mangueras.map(manguera => ({
              numero: manguera.numero,
              color: manguera.color,
              productoId: manguera.productoId,
              activo: manguera.activo ?? true,
            })),
          },
        },
        include: {
          mangueras: {
            include: {
              producto: true,
            },
          },
        },
      });

      return this.formatSurtidor(surtidor);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Error creating surtidor: ${error.message}`);
    }
  }

  async findAll(page = 1, limit = 10, activo?: boolean): Promise<SurtidorListResponse> {
    try {
      const skip = (page - 1) * limit;
      
      const whereCondition: any = {};
      if (activo !== undefined) {
        whereCondition.activo = activo;
      }

      const [surtidores, total] = await Promise.all([
        this.prisma.surtidor.findMany({
          where: whereCondition,
          include: {
            mangueras: {
              include: {
                producto: true,
              },
              orderBy: { numero: 'asc' },
            },
          },
          orderBy: { numero: 'asc' },
          skip,
          take: limit,
        }),
        this.prisma.surtidor.count({ where: whereCondition }),
      ]);

      return {
        surtidores: surtidores.map(this.formatSurtidor),
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error fetching surtidores: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Surtidor> {
    try {
      const surtidor = await this.prisma.surtidor.findUnique({
        where: { id },
        include: {
          mangueras: {
            include: {
              producto: true,
            },
            orderBy: { numero: 'asc' },
          },
        },
      });

      if (!surtidor) {
        throw new NotFoundException(`Surtidor with ID ${id} not found`);
      }

      return this.formatSurtidor(surtidor);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error fetching surtidor: ${error.message}`);
    }
  }

  async findByNumero(numero: string): Promise<Surtidor | null> {
    try {
      const surtidor = await this.prisma.surtidor.findUnique({
        where: { numero },
        include: {
          mangueras: {
            include: {
              producto: true,
            },
            orderBy: { numero: 'asc' },
          },
        },
      });

      return surtidor ? this.formatSurtidor(surtidor) : null;
    } catch (error) {
      throw new Error(`Error fetching surtidor by number: ${error.message}`);
    }
  }

  async update(id: string, updateSurtidorInput: UpdateSurtidorInput): Promise<Surtidor> {
    try {
      const existingSurtidor = await this.findOne(id);

      // Si se están actualizando mangueras, validar
      if (updateSurtidorInput.mangueras) {
        const cantidadMangueras = updateSurtidorInput.cantidadMangueras ?? existingSurtidor.cantidadMangueras;
        if (updateSurtidorInput.mangueras.length !== cantidadMangueras) {
          throw new BadRequestException(
            `El número de mangueras (${updateSurtidorInput.mangueras.length}) no coincide con la cantidad especificada (${cantidadMangueras})`
          );
        }

        // Verificar que los productos existan
        const productIds = updateSurtidorInput.mangueras.map(m => m.productoId).filter(Boolean);
        if (productIds.length > 0) {
          const productos = await this.prisma.producto.findMany({
            where: { id: { in: productIds } },
          });

          if (productos.length !== productIds.length) {
            const foundIds = productos.map(p => p.id);
            const missingIds = productIds.filter(id => !foundIds.includes(id));
            throw new BadRequestException(`Productos no encontrados: ${missingIds.join(', ')}`);
          }
        }
      }

      const surtidor = await this.prisma.surtidor.update({
        where: { id },
        data: {
          ...updateSurtidorInput,
          mangueras: updateSurtidorInput.mangueras ? {
            deleteMany: {},
            create: updateSurtidorInput.mangueras.map(manguera => ({
              numero: manguera.numero,
              color: manguera.color,
              productoId: manguera.productoId,
              activo: manguera.activo ?? true,
            })),
          } : undefined,
        },
        include: {
          mangueras: {
            include: {
              producto: true,
            },
            orderBy: { numero: 'asc' },
          },
        },
      });

      return this.formatSurtidor(surtidor);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Error updating surtidor: ${error.message}`);
    }
  }

  async remove(id: string): Promise<Surtidor> {
    try {
      const existingSurtidor = await this.findOne(id);

      const surtidor = await this.prisma.surtidor.delete({
        where: { id },
        include: {
          mangueras: {
            include: {
              producto: true,
            },
          },
        },
      });

      return this.formatSurtidor(surtidor);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error deleting surtidor: ${error.message}`);
    }
  }

  async validateSurtidorExists(numero: string): Promise<boolean> {
    try {
      const surtidor = await this.prisma.surtidor.findUnique({
        where: { 
          numero,
          activo: true,
        },
      });
      return !!surtidor;
    } catch (error) {
      return false;
    }
  }

  async validateMangueraExists(numeroSurtidor: string, numeroManguera: string, codigoProducto?: string): Promise<boolean> {
    try {
      const manguera = await this.prisma.mangueraSurtidor.findFirst({
        where: {
          numero: numeroManguera,
          activo: true,
          surtidor: {
            numero: numeroSurtidor,
            activo: true,
          },
          ...(codigoProducto && {
            producto: {
              codigo: codigoProducto,
            },
          }),
        },
      });
      return !!manguera;
    } catch (error) {
      return false;
    }
  }

  private formatSurtidor(surtidor: any): Surtidor {
    return {
      id: surtidor.id,
      numero: surtidor.numero,
      nombre: surtidor.nombre,
      descripcion: surtidor.descripcion,
      ubicacion: surtidor.ubicacion,
      cantidadMangueras: surtidor.cantidadMangueras,
      activo: surtidor.activo,
      fechaInstalacion: surtidor.fechaInstalacion,
      fechaMantenimiento: surtidor.fechaMantenimiento,
      observaciones: surtidor.observaciones,
      createdAt: surtidor.createdAt,
      updatedAt: surtidor.updatedAt,
      mangueras: surtidor.mangueras?.map((manguera: any) => ({
        id: manguera.id,
        numero: manguera.numero,
        color: manguera.color,
        activo: manguera.activo,
        createdAt: manguera.createdAt,
        updatedAt: manguera.updatedAt,
        surtidorId: manguera.surtidorId,
        surtidor: surtidor,
        productoId: manguera.productoId,
        producto: manguera.producto,
      })) || [],
    };
  }
} 