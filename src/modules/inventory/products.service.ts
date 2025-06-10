import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper method to convert Prisma product to GraphQL entity
  private formatProduct(product: any): Producto {
    const precio = parseFloat(product.precio?.toString() || '0');
    const costo = parseFloat(product.costo?.toString() || '0');
    
    return {
      ...product,
      precio: precio,
      costo: costo,
      utilidad: precio - costo,
      margenUtilidad: precio > 0 ? ((precio - costo) / precio) * 100 : 0,
    } as Producto;
  }

  // Helper method to convert array of Prisma products to GraphQL entities
  private formatProducts(products: any[]): Producto[] {
    return products.map(product => this.formatProduct(product));
  }

  async create(createProductInput: CreateProductInput): Promise<Producto> {
    // Verificar si el código ya existe
    const existingProduct = await this.prisma.producto.findUnique({
      where: { codigo: createProductInput.codigo },
    });

    if (existingProduct) {
      throw new ConflictException('El código del producto ya existe');
    }

    const producto = await this.prisma.producto.create({
      data: createProductInput,
      include: { categoria: true },
    });

    return this.formatProduct(producto);
  }

  async findAll(filters?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    categoriaId?: string;
    activo?: boolean;
    esCombustible?: boolean;
  }): Promise<{ products: Producto[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtros opcionales - solo agregar si tienen valores válidos
    if (filters?.searchTerm && filters.searchTerm.trim() !== '') {
      where.OR = [
        { nombre: { contains: filters.searchTerm, mode: 'insensitive' } },
        { codigo: { contains: filters.searchTerm } },
        { descripcion: { contains: filters.searchTerm, mode: 'insensitive' } },
      ];
    }

    if (filters?.categoriaId && filters.categoriaId.trim() !== '') {
      where.categoriaId = filters.categoriaId;
    }

    if (filters?.activo !== undefined && filters?.activo !== null) {
      where.activo = filters.activo;
    }

    if (filters?.esCombustible !== undefined && filters?.esCombustible !== null) {
      where.esCombustible = filters.esCombustible;
    }

    const [productos, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        include: { categoria: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.producto.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products: this.formatProducts(productos),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<Producto | null> {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    return producto ? this.formatProduct(producto) : null;
  }

  async findByCode(codigo: string): Promise<Producto | null> {
    const producto = await this.prisma.producto.findUnique({
      where: { codigo },
      include: { categoria: true },
    });

    return producto ? this.formatProduct(producto) : null;
  }

  async findByCategory(categoriaId: string): Promise<Producto[]> {
    const productos = await this.prisma.producto.findMany({
      where: { categoriaId },
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });

    return this.formatProducts(productos);
  }

  async findActive(): Promise<Producto[]> {
    const productos = await this.prisma.producto.findMany({
      where: { activo: true },
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });

    return this.formatProducts(productos);
  }

  async findLowStock(): Promise<Producto[]> {
    const productos = await this.prisma.producto.findMany({
      where: {
        stockActual: {
          lte: { stockMinimo: true } as any,
        },
      },
      include: { categoria: true },
      orderBy: { stockActual: 'asc' },
    });

    return this.formatProducts(productos);
  }

  async findFuel(): Promise<Producto[]> {
    const productos = await this.prisma.producto.findMany({
      where: { esCombustible: true },
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });

    return this.formatProducts(productos);
  }

  async searchProducts(searchTerm: string): Promise<Producto[]> {
    const productos = await this.prisma.producto.findMany({
      where: {
        OR: [
          { nombre: { contains: searchTerm, mode: 'insensitive' } },
          { codigo: { contains: searchTerm } },
          { descripcion: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });

    return this.formatProducts(productos);
  }

  async update(id: string, updateProductInput: UpdateProductInput): Promise<Producto> {
    const existingProduct = await this.findById(id);
    
    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Si se está actualizando el código, verificar que no exista
    if (updateProductInput.codigo && updateProductInput.codigo !== existingProduct.codigo) {
      const codeExists = await this.prisma.producto.findUnique({
        where: { codigo: updateProductInput.codigo },
      });

      if (codeExists) {
        throw new ConflictException('El código del producto ya existe');
      }
    }

    const producto = await this.prisma.producto.update({
      where: { id },
      data: updateProductInput,
      include: { categoria: true },
    });

    return this.formatProduct(producto);
  }

  async updateStock(id: string, cantidad: number, tipo: 'entrada' | 'salida'): Promise<Producto> {
    const product = await this.findById(id);
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const newStock = tipo === 'entrada' 
      ? product.stockActual + cantidad 
      : product.stockActual - cantidad;

    if (newStock < 0) {
      throw new ConflictException('Stock insuficiente');
    }

    const producto = await this.prisma.producto.update({
      where: { id },
      data: { stockActual: newStock },
      include: { categoria: true },
    });

    return this.formatProduct(producto);
  }

  async remove(id: string): Promise<Producto> {
    const existingProduct = await this.findById(id);
    
    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar si tiene ventas asociadas
    const salesCount = await this.prisma.detalleVenta.count({
      where: { productoId: id },
    });

    if (salesCount > 0) {
      throw new ConflictException('No se puede eliminar el producto porque tiene ventas asociadas');
    }

    const producto = await this.prisma.producto.delete({
      where: { id },
      include: { categoria: true },
    });

    return this.formatProduct(producto);
  }

  async toggleProductStatus(id: string): Promise<Producto> {
    const product = await this.findById(id);
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const updatedProduct = await this.prisma.producto.update({
      where: { id },
      data: { activo: !product.activo },
      include: { categoria: true },
    });

    return this.formatProduct(updatedProduct);
  }

  async getProductStats() {
    const totalProducts = await this.prisma.producto.count();
    const activeProducts = await this.prisma.producto.count({
      where: { activo: true },
    });
    const lowStockProducts = await this.prisma.producto.count({
      where: {
        AND: [
          { activo: true },
          {
            stockActual: {
              lte: { stockMinimo: true } as any,
            },
          },
        ],
      },
    });

    const inventoryValue = await this.prisma.producto.aggregate({
      where: { activo: true },
      _sum: {
        stockActual: true,
      },
    });

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      lowStockProducts,
      inventoryValue: inventoryValue._sum.stockActual || 0,
    };
  }

  async updateTankLevel(productoId: string, cantidad: number, tipo: 'entrada' | 'salida'): Promise<boolean> {
    try {
      // Buscar el tanque asociado al producto
      const tanque = await this.prisma.tanque.findFirst({
        where: { 
          productoId: productoId,
          activo: true 
        },
      });

      if (!tanque) {
        throw new NotFoundException('No se encontró tanque activo para este producto');
      }

      // Calcular nuevo nivel
      const nivelActualDecimal = parseFloat(tanque.nivelActual.toString());
      const nuevoNivel = tipo === 'entrada' 
        ? nivelActualDecimal + cantidad 
        : nivelActualDecimal - cantidad;

      // Verificar que no exceda la capacidad
      const capacidadTotal = parseFloat(tanque.capacidadTotal.toString());
      if (nuevoNivel > capacidadTotal) {
        throw new ConflictException('El nivel excede la capacidad del tanque');
      }

      // Verificar que no sea negativo
      if (nuevoNivel < 0) {
        throw new ConflictException('Nivel de tanque insuficiente');
      }

      // Actualizar el tanque
      await this.prisma.tanque.update({
        where: { id: tanque.id },
        data: { 
          nivelActual: nuevoNivel,
          updatedAt: new Date()
        },
      });

      return true;
    } catch (error) {
      // Re-lanzar la excepción para que pueda ser manejada en el resolver
      throw error;
    }
  }

  async getTankStatus() {
    try {
      const tanques = await this.prisma.tanque.findMany({
        where: { activo: true },
        include: {
          producto: {
            select: {
              codigo: true,
              nombre: true,
              unidadMedida: true
            }
          }
        },
        orderBy: { numero: 'asc' },
      });

      return tanques.map(tanque => ({
        numero: tanque.numero,
        nivelActual: parseFloat(tanque.nivelActual.toString()),
        capacidadTotal: parseFloat(tanque.capacidadTotal.toString()),
        nivelMinimo: parseFloat(tanque.nivelMinimo.toString()),
        porcentajeLlenado: Math.round((parseFloat(tanque.nivelActual.toString()) / parseFloat(tanque.capacidadTotal.toString())) * 100),
        producto: tanque.producto,
        estado: parseFloat(tanque.nivelActual.toString()) <= parseFloat(tanque.nivelMinimo.toString()) ? 'BAJO' : 'NORMAL',
        updatedAt: tanque.updatedAt
      }));
    } catch (error) {
      throw new Error(`Error consultando tanques: ${error.message}`);
    }
  }

  async saveShiftClosure(cierreData: {
    turnoId: string;
    usuarioId: string;
    totalVentasLitros: number;
    totalVentasGalones: number;
    valorTotalGeneral: number;
    productosActualizados: number;
    tanquesActualizados: number;
    estado: string;
    errores?: string[];
    advertencias?: string[];
    resumenSurtidores: any[];
    observacionesGenerales?: string;
  }) {
    try {
      const cierreTurno = await this.prisma.cierreTurno.create({
        data: {
          turnoId: cierreData.turnoId,
          usuarioId: cierreData.usuarioId,
          totalVentasLitros: cierreData.totalVentasLitros,
          totalVentasGalones: cierreData.totalVentasGalones,
          valorTotalGeneral: cierreData.valorTotalGeneral,
          productosActualizados: cierreData.productosActualizados,
          tanquesActualizados: cierreData.tanquesActualizados,
          estado: cierreData.estado,
          errores: cierreData.errores || [],
          advertencias: cierreData.advertencias || [],
          resumenSurtidores: cierreData.resumenSurtidores,
          observacionesGenerales: cierreData.observacionesGenerales
        },
        include: {
          turno: true,
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              username: true
            }
          }
        }
      });

      return cierreTurno;
    } catch (error) {
      throw new Error(`Error guardando cierre de turno: ${error.message}`);
    }
  }

  async getShiftClosures(filters?: {
    turnoId?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    estado?: string;
    usuarioId?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters?.turnoId) {
        where.turnoId = filters.turnoId;
      }

      if (filters?.fechaDesde || filters?.fechaHasta) {
        where.fechaCierre = {};
        if (filters.fechaDesde) {
          where.fechaCierre.gte = filters.fechaDesde;
        }
        if (filters.fechaHasta) {
          where.fechaCierre.lte = filters.fechaHasta;
        }
      }

      if (filters?.estado) {
        where.estado = filters.estado;
      }

      if (filters?.usuarioId) {
        where.usuarioId = filters.usuarioId;
      }

      const [cierres, total] = await Promise.all([
        this.prisma.cierreTurno.findMany({
          where,
          include: {
            turno: true,
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                username: true
              }
            }
          },
          orderBy: { fechaCierre: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.cierreTurno.count({ where })
      ]);

      return {
        cierres: cierres.map(cierre => ({
          ...cierre,
          totalVentasLitros: parseFloat(cierre.totalVentasLitros.toString()),
          totalVentasGalones: parseFloat(cierre.totalVentasGalones.toString()),
          valorTotalGeneral: parseFloat(cierre.valorTotalGeneral.toString()),
          resumenSurtidores: typeof cierre.resumenSurtidores === 'string' 
            ? JSON.parse(cierre.resumenSurtidores) 
            : cierre.resumenSurtidores
        })),
        total,
        page,
        limit
      };
    } catch (error) {
      throw new Error(`Error consultando cierres de turno: ${error.message}`);
    }
  }

  async getShiftClosureById(id: string) {
    try {
      const cierre = await this.prisma.cierreTurno.findUnique({
        where: { id },
        include: {
          turno: true,
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              username: true
            }
          }
        }
      });

      if (!cierre) {
        throw new NotFoundException('Cierre de turno no encontrado');
      }

      return {
        ...cierre,
        totalVentasLitros: parseFloat(cierre.totalVentasLitros.toString()),
        totalVentasGalones: parseFloat(cierre.totalVentasGalones.toString()),
        valorTotalGeneral: parseFloat(cierre.valorTotalGeneral.toString()),
        resumenSurtidores: typeof cierre.resumenSurtidores === 'string' 
          ? JSON.parse(cierre.resumenSurtidores) 
          : cierre.resumenSurtidores
      };
    } catch (error) {
      throw new Error(`Error consultando cierre de turno: ${error.message}`);
    }
  }
} 