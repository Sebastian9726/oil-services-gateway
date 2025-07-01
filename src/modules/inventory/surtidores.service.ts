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
              lecturaAnterior: manguera.lecturaAnterior ?? 0,
              lecturaActual: manguera.lecturaActual ?? 0,
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
      // Si limit es -1, obtener todos los registros sin paginación
      const usesPagination = limit !== -1;
      const skip = usesPagination ? (page - 1) * limit : 0;
      
      const whereCondition: any = {};
      if (activo !== undefined) {
        whereCondition.activo = activo;
      }

      // Configurar la query
      const queryOptions: any = {
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
      };

      // Solo agregar skip y take si se usa paginación
      if (usesPagination) {
        queryOptions.skip = skip;
        queryOptions.take = limit;
      }

      const [surtidores, total] = await Promise.all([
        this.prisma.surtidor.findMany(queryOptions),
        this.prisma.surtidor.count({ where: whereCondition }),
      ]);

      const actualLimit = usesPagination ? limit : total;
      const actualPage = usesPagination ? page : 1;

      return {
        surtidores: surtidores.map(this.formatSurtidor),
        total,
        page: actualPage,
        limit: actualLimit,
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
              lecturaAnterior: manguera.lecturaAnterior ?? 0,
              lecturaActual: manguera.lecturaActual ?? 0,
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

  async updateMangueraReadings(numeroSurtidor: string, numeroManguera: string, lecturaAnterior: number, lecturaActual: number): Promise<boolean> {
    try {
      const manguera = await this.prisma.mangueraSurtidor.findFirst({
        where: {
          numero: numeroManguera,
          surtidor: {
            numero: numeroSurtidor,
          },
        },
      });

      if (!manguera) {
        return false;
      }

      await this.prisma.mangueraSurtidor.update({
        where: { id: manguera.id },
        data: {
          lecturaAnterior,
          lecturaActual,
        },
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Actualiza las lecturas de una manguera y crea un registro de historial
   * ESTA ES LA LÓGICA CORRECTA PARA USAR EN PROCESS SHIFT CLOSURE
   */
  async updateMangueraReadingsWithHistory(
    numeroSurtidor: string, 
    numeroManguera: string, 
    nuevaLectura: number,
    precio: number,
    tipoOperacion: string = 'cierre_turno',
    usuarioId?: string,
    turnoId?: string,
    cierreTurnoId?: string,
    observaciones?: string
  ): Promise<{ success: boolean; cantidadVendida: number; valorVenta: number }> {
    console.log(`[SURTIDORES] updateMangueraReadingsWithHistory iniciado:`, {
      numeroSurtidor,
      numeroManguera,
      nuevaLectura,
      precio,
      tipoOperacion,
      usuarioId,
      turnoId
    });

    try {
      const manguera = await this.prisma.mangueraSurtidor.findFirst({
        where: {
          numero: numeroManguera,
          surtidor: {
            numero: numeroSurtidor,
            activo: true,
          },
          activo: true,
        },
        include: {
          producto: true,
        },
      });

      console.log(`[SURTIDORES] Manguera encontrada:`, manguera ? {
        id: manguera.id,
        numero: manguera.numero,
        lecturaAnterior: manguera.lecturaAnterior,
        lecturaActual: manguera.lecturaActual,
        producto: manguera.producto.codigo
      } : 'NO ENCONTRADA');

      if (!manguera) {
        console.error(`[SURTIDORES] Manguera no encontrada: ${numeroSurtidor}/${numeroManguera}`);
        return { success: false, cantidadVendida: 0, valorVenta: 0 };
      }

      // OBTENER LA LECTURA ACTUAL DE LA BASE DE DATOS (será la "anterior" en el historial)
      const lecturaAnteriorDB = Number(manguera.lecturaActual) || 0;
      const cantidadVendida = Math.max(0, nuevaLectura - lecturaAnteriorDB);
      const valorVenta = cantidadVendida * precio;

      console.log(`[SURTIDORES] Cálculos:`, {
        lecturaAnteriorDB,
        nuevaLectura,
        cantidadVendida,
        valorVenta
      });

      // Actualizar las lecturas en la manguera
      const mangueraActualizada = await this.prisma.mangueraSurtidor.update({
        where: { id: manguera.id },
        data: {
          lecturaAnterior: lecturaAnteriorDB, // La lectura que tenía se vuelve "anterior"
          lecturaActual: nuevaLectura,        // La nueva lectura se vuelve "actual"
        },
      });

      console.log(`[SURTIDORES] Manguera actualizada en BD:`, {
        id: mangueraActualizada.id,
        lecturaAnterior: mangueraActualizada.lecturaAnterior,
        lecturaActual: mangueraActualizada.lecturaActual
      });

      // Crear registro en el historial
      const historialCreado = await this.prisma.historialLectura.create({
        data: {
          mangueraId: manguera.id,
          fechaLectura: new Date(),
          lecturaAnterior: lecturaAnteriorDB,
          lecturaActual: nuevaLectura,
          cantidadVendida,
          valorVenta,
          tipoOperacion,
          observaciones,
          usuarioId,
          turnoId,
          cierreTurnoId,
        },
      });

      console.log(`[SURTIDORES] Historial creado:`, {
        id: historialCreado.id,
        lecturaAnterior: historialCreado.lecturaAnterior,
        lecturaActual: historialCreado.lecturaActual,
        cantidadVendida: historialCreado.cantidadVendida
      });

      return { success: true, cantidadVendida, valorVenta };
    } catch (error) {
      console.error('[SURTIDORES] Error updating manguera readings with history:', error);
      return { success: false, cantidadVendida: 0, valorVenta: 0 };
    }
  }

  /**
   * Obtiene el historial de lecturas de una manguera específica
   */
  async getMangueraReadingHistory(
    numeroSurtidor: string,
    numeroManguera: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;
      
      const where = {
        manguera: {
          numero: numeroManguera,
          surtidor: {
            numero: numeroSurtidor,
          },
        },
        ...(fechaDesde && fechaHasta && {
          fechaLectura: {
            gte: fechaDesde,
            lte: fechaHasta,
          },
        }),
      };

      const [historialRaw, total] = await Promise.all([
        this.prisma.historialLectura.findMany({
          where,
          include: {
            manguera: {
              include: {
                surtidor: true,
                producto: true,
              },
            },
          },
          orderBy: { fechaLectura: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.historialLectura.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      // Format the response to match GraphQL types
      const historial = historialRaw.map(item => ({
        id: item.id,
        fechaLectura: item.fechaLectura,
        lecturaAnterior: Number(item.lecturaAnterior),
        lecturaActual: Number(item.lecturaActual),
        cantidadVendida: Number(item.cantidadVendida),
        valorVenta: Number(item.valorVenta),
        tipoOperacion: item.tipoOperacion,
        observaciones: item.observaciones,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        mangueraId: item.mangueraId,
        manguera: {
          id: item.manguera.id,
          numero: item.manguera.numero,
          color: item.manguera.color,
          lecturaAnterior: Number(item.manguera.lecturaAnterior),
          lecturaActual: Number(item.manguera.lecturaActual),
          activo: item.manguera.activo,
          createdAt: item.manguera.createdAt,
          updatedAt: item.manguera.updatedAt,
          surtidorId: item.manguera.surtidorId,
          surtidor: item.manguera.surtidor,
          productoId: item.manguera.productoId,
          producto: {
            id: item.manguera.producto.id,
            codigo: item.manguera.producto.codigo,
            nombre: item.manguera.producto.nombre,
            descripcion: item.manguera.producto.descripcion,
            unidadMedida: item.manguera.producto.unidadMedida,
            precio: Number(item.manguera.producto.precio),
            costo: 0, // Default value - not in schema
            utilidad: 0, // Default value - not in schema  
            margenUtilidad: 0, // Default value - not in schema
            stockMinimo: item.manguera.producto.stockMinimo,
            stockActual: item.manguera.producto.stockActual,
            esCombustible: item.manguera.producto.esCombustible,
            activo: item.manguera.producto.activo,
            createdAt: item.manguera.producto.createdAt,
            updatedAt: item.manguera.producto.updatedAt,
            categoriaId: item.manguera.producto.categoriaId,
            categoria: {
              id: '',
              nombre: '',
              descripcion: null,
              activo: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
        usuarioId: item.usuarioId,
        turnoId: item.turnoId,
        cierreTurnoId: item.cierreTurnoId,
      }));

      return {
        historial,
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      throw new Error(`Error getting reading history: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las lecturas actuales de un surtidor
   */
  async getCurrentReadings(numeroSurtidor: string) {
    try {
      const surtidor = await this.prisma.surtidor.findFirst({
        where: {
          numero: numeroSurtidor,
          activo: true,
        },
        include: {
          mangueras: {
            where: { activo: true },
            include: {
              producto: true,
            },
            orderBy: { numero: 'asc' },
          },
        },
      });

      if (!surtidor) {
        throw new NotFoundException(`Surtidor ${numeroSurtidor} no encontrado`);
      }

      return surtidor.mangueras.map(manguera => ({
        numeroManguera: manguera.numero,
        lecturaAnterior: Number(manguera.lecturaAnterior) || 0,
        lecturaActual: Number(manguera.lecturaActual) || 0,
        producto: {
          codigo: manguera.producto.codigo,
          nombre: manguera.producto.nombre,
          precio: Number(manguera.producto.precio),
        },
      }));
    } catch (error) {
      throw new Error(`Error getting current readings: ${error.message}`);
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
        lecturaAnterior: Number(manguera.lecturaAnterior) || 0,
        lecturaActual: Number(manguera.lecturaActual) || 0,
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