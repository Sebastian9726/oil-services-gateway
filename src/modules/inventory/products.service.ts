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
    const precioCompra = parseFloat(product.precioCompra?.toString() || '0');
    const precioVenta = parseFloat(product.precioVenta?.toString() || '0');
    
    // Calcular métricas de rentabilidad
    const utilidad = precioVenta - precioCompra;
    const margenUtilidad = precioVenta > 0 ? (utilidad / precioVenta) * 100 : 0;
    const porcentajeGanancia = precioCompra > 0 ? (utilidad / precioCompra) * 100 : 0;
    
    return {
      ...product,
      precioCompra: precioCompra,
      precioVenta: precioVenta,
      utilidad: utilidad,
      margenUtilidad: Math.round(margenUtilidad * 100) / 100, // Redondear a 2 decimales
      porcentajeGanancia: Math.round(porcentajeGanancia * 100) / 100, // Redondear a 2 decimales
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
      data: {
        codigo: createProductInput.codigo,
        nombre: createProductInput.nombre,
        descripcion: createProductInput.descripcion,
        unidadMedida: createProductInput.unidadMedida,
        precioCompra: createProductInput.precioCompra,
        precioVenta: createProductInput.precioVenta,
        moneda: createProductInput.moneda || 'COP',
        stockMinimo: createProductInput.stockMinimo || 0,
        stockActual: createProductInput.stockActual || 0,
        esCombustible: createProductInput.esCombustible || false,
        categoriaId: createProductInput.categoriaId,
      },
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

  async updateTankLevelForPointOfSale(productoId: string, puntoVentaId: string, cantidad: number, tipo: 'entrada' | 'salida'): Promise<boolean> {
    try {
      // Buscar el tanque específico del punto de venta para este producto
      const tanque = await this.prisma.tanque.findFirst({
        where: { 
          productoId: productoId,
          puntoVentaId: puntoVentaId,
          activo: true 
        },
        include: {
          producto: true,
          puntoVenta: true
        }
      });

      if (!tanque) {
        console.log(`[TANQUE] No se encontró tanque para producto ${productoId} en punto de venta ${puntoVentaId}`);
        throw new NotFoundException(`No se encontró tanque activo para este producto en el punto de venta especificado`);
      }

      console.log(`[TANQUE] Tanque encontrado: ${tanque.numero} - Producto: ${tanque.producto.codigo} - Punto de Venta: ${tanque.puntoVenta.codigo}`);

      // Calcular nuevo nivel
      const nivelActualDecimal = parseFloat(tanque.nivelActual.toString());
      const nuevoNivel = tipo === 'entrada' 
        ? nivelActualDecimal + cantidad 
        : nivelActualDecimal - cantidad;

      console.log(`[TANQUE] Nivel actual: ${nivelActualDecimal}L, Cantidad: ${cantidad}L (${tipo}), Nuevo nivel: ${nuevoNivel}L`);

      // Verificar que no exceda la capacidad
      const capacidadTotal = parseFloat(tanque.capacidadTotal.toString());
      if (nuevoNivel > capacidadTotal) {
        throw new ConflictException(`El nivel ${nuevoNivel}L excede la capacidad del tanque ${capacidadTotal}L`);
      }

      // Verificar que no sea negativo
      if (nuevoNivel < 0) {
        throw new ConflictException(`Nivel de tanque insuficiente: se requiere ${cantidad}L pero solo hay ${nivelActualDecimal}L`);
      }

      // Actualizar el tanque
      const tanqueActualizado = await this.prisma.tanque.update({
        where: { id: tanque.id },
        data: { 
          nivelActual: nuevoNivel,
          updatedAt: new Date()
        },
      });

      console.log(`[TANQUE] Tanque ${tanque.numero} actualizado exitosamente: ${nivelActualDecimal}L -> ${nuevoNivel}L`);

      return true;
    } catch (error) {
      console.error(`[TANQUE] Error actualizando tanque:`, error);
      // Re-lanzar la excepción para que pueda ser manejada en el resolver
      throw error;
    }
  }

  async getTankStatus() {
    const tanks = await this.prisma.producto.findMany({
      where: { esCombustible: true },
            select: {
        id: true,
              codigo: true,
              nombre: true,
        stockActual: true,
        stockMinimo: true
      }
      });

    return tanks.map(tank => ({
      ...tank,
      nivelTanque: tank.stockActual,
      alertaBajo: tank.stockActual <= tank.stockMinimo,
      estado: tank.stockActual <= tank.stockMinimo ? 'BAJO' : 'NORMAL'
    }));
  }

  /**
   * Análisis de rentabilidad de productos
   */
  async getProductRentabilityAnalysis(): Promise<any> {
    const productos = await this.prisma.producto.findMany({
      where: { activo: true },
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });

    const productosConRentabilidad = productos.map(producto => {
      const precioCompra = parseFloat(producto.precioCompra?.toString() || '0');
      const precioVenta = parseFloat(producto.precioVenta?.toString() || '0');
      const utilidad = precioVenta - precioCompra;
      const margenUtilidad = precioVenta > 0 ? (utilidad / precioVenta) * 100 : 0;
      const porcentajeGanancia = precioCompra > 0 ? (utilidad / precioCompra) * 100 : 0;

      // Clasificación de rentabilidad
      let clasificacionRentabilidad = 'BAJA';
      if (margenUtilidad >= 30) clasificacionRentabilidad = 'ALTA';
      else if (margenUtilidad >= 15) clasificacionRentabilidad = 'MEDIA';

      // Recomendaciones automáticas
      let recomendacion = '';
      if (margenUtilidad < 10) {
        recomendacion = 'Considere aumentar el precio de venta o reducir costos de compra';
      } else if (margenUtilidad > 50) {
        recomendacion = 'Excelente margen - monitorear competencia';
      } else {
        recomendacion = 'Margen saludable - mantener seguimiento';
      }

      return {
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precioCompra,
        precioVenta,
        moneda: producto.moneda,
        utilidad: Math.round(utilidad * 100) / 100,
        margenUtilidad: Math.round(margenUtilidad * 100) / 100,
        porcentajeGanancia: Math.round(porcentajeGanancia * 100) / 100,
        ventasEstimadas: producto.stockActual * 0.3, // Estimación simple
        utilidadProyectada: Math.round((utilidad * producto.stockActual * 0.3) * 100) / 100,
        clasificacionRentabilidad,
        recomendacion,
      };
    });

    return productosConRentabilidad;
  }

  /**
   * Resumen de rentabilidad general
   */
  async getRentabilitySummary(): Promise<any> {
    const productos = await this.getProductRentabilityAnalysis();

    if (productos.length === 0) {
      return {
        productos: [],
        utilidadTotalProyectada: 0,
        margenPromedioGeneral: 0,
        productoMasRentable: 'N/A',
        productoMenosRentable: 'N/A',
        totalProductos: 0,
      };
    }

    const utilidadTotalProyectada = productos.reduce((sum, p) => sum + p.utilidadProyectada, 0);
    const margenPromedio = productos.reduce((sum, p) => sum + p.margenUtilidad, 0) / productos.length;

    const productoMasRentable = productos.reduce((max, p) => 
      p.margenUtilidad > max.margenUtilidad ? p : max
    );

    const productoMenosRentable = productos.reduce((min, p) => 
      p.margenUtilidad < min.margenUtilidad ? p : min
    );

    return {
      productos,
      utilidadTotalProyectada: Math.round(utilidadTotalProyectada * 100) / 100,
      margenPromedioGeneral: Math.round(margenPromedio * 100) / 100,
      productoMasRentable: `${productoMasRentable.codigo} - ${productoMasRentable.nombre} (${productoMasRentable.margenUtilidad}%)`,
      productoMenosRentable: `${productoMenosRentable.codigo} - ${productoMenosRentable.nombre} (${productoMenosRentable.margenUtilidad}%)`,
      totalProductos: productos.length,
    };
  }

  /**
   * Sugerir precios optimizados
   */
  async suggestOptimalPricing(productoId: string, margenObjetivo: number = 25): Promise<any> {
    const producto = await this.findById(productoId);
    
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const precioCompra = producto.precioCompra;
    const precioVentaActual = producto.precioVenta;
    
    // Calcular precio óptimo basado en margen objetivo
    const precioVentaOptimo = precioCompra / (1 - (margenObjetivo / 100));
    
    // Calcular diferentes escenarios
    const escenarios = [
      {
        nombre: 'Conservador (15% margen)',
        precioVenta: precioCompra / (1 - 0.15),
        margen: 15,
      },
      {
        nombre: 'Objetivo (25% margen)',
        precioVenta: precioVentaOptimo,
        margen: margenObjetivo,
      },
      {
        nombre: 'Agresivo (35% margen)',
        precioVenta: precioCompra / (1 - 0.35),
        margen: 35,
      },
    ];

    return {
      productoActual: {
        codigo: producto.codigo,
        nombre: producto.nombre,
        precioCompra,
        precioVentaActual,
        margenActual: producto.margenUtilidad,
      },
      escenarios: escenarios.map(e => ({
        ...e,
        precioVenta: Math.round(e.precioVenta * 100) / 100,
        utilidadPorUnidad: Math.round((e.precioVenta - precioCompra) * 100) / 100,
        diferenciaPrecioActual: Math.round((e.precioVenta - precioVentaActual) * 100) / 100,
      })),
      recomendacion: margenObjetivo <= producto.margenUtilidad 
        ? 'El margen actual ya cumple o supera el objetivo'
        : `Considere ajustar el precio de venta a $${Math.round(precioVentaOptimo * 100) / 100} ${producto.moneda}`,
    };
  }

  async validateTurnoExists(turnoId: string): Promise<boolean> {
    try {
      const turno = await this.prisma.turno.findUnique({
        where: { id: turnoId }
      });
      return !!turno;
    } catch (error) {
      console.error('Error validating turno:', error);
      return false;
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