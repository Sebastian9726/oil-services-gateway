import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { UnitConversionService } from './services/unit-conversion.service';
import { ProductoWithConversions } from './entities/producto-with-conversions.entity';

@Injectable()
export class ProductsEnhancedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unitConversion: UnitConversionService,
  ) {}

  /**
   * Convierte un producto de Prisma a entidad GraphQL con conversiones
   */
  private formatProductWithConversions(product: any): ProductoWithConversions {
    const baseProduct = {
      ...product,
      precio: parseFloat(product.precio.toString()),
    };

    // Si es combustible, agregamos conversiones automáticas
    if (product.esCombustible) {
      const conversionInfo = this.unitConversion.getConversionInfo(
        product.stockActual,
        product.unidadMedida
      );

      return {
        ...baseProduct,
        stockEnLitros: {
          cantidad: conversionInfo.litros.cantidad,
          unidad: 'litros',
          formatted: this.unitConversion.formatQuantity(
            conversionInfo.litros.cantidad,
            'litros'
          ),
        },
        stockEnGalones: {
          cantidad: conversionInfo.galones.cantidad,
          unidad: 'galones',
          formatted: this.unitConversion.formatQuantity(
            conversionInfo.galones.cantidad,
            'galones'
          ),
        },
        precioLitro: this.unitConversion.convert(
          baseProduct.precio,
          product.unidadMedida,
          'litros'
        ),
        precioGalon: this.unitConversion.convert(
          baseProduct.precio,
          product.unidadMedida,
          'galones'
        ),
      };
    }

    return baseProduct;
  }

  /**
   * Encuentra todos los combustibles con conversiones automáticas
   */
  async findFuelWithConversions(): Promise<ProductoWithConversions[]> {
    const productos = await this.prisma.producto.findMany({
      where: { esCombustible: true, activo: true },
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });

    return productos.map(product => this.formatProductWithConversions(product));
  }

  /**
   * Encuentra un producto por código con conversiones
   */
  async findByCodeWithConversions(codigo: string): Promise<ProductoWithConversions | null> {
    const producto = await this.prisma.producto.findUnique({
      where: { codigo },
      include: { categoria: true },
    });

    return producto ? this.formatProductWithConversions(producto) : null;
  }

  /**
   * Actualiza stock con conversión automática a unidad base
   */
  async updateStockWithConversion(
    id: string,
    cantidad: number,
    unidadEntrada: string,
    tipo: 'entrada' | 'salida'
  ): Promise<ProductoWithConversions> {
    const product = await this.prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Convertir cantidad de entrada a la unidad del producto
    const cantidadConvertida = this.unitConversion.convert(
      cantidad,
      unidadEntrada,
      product.unidadMedida
    );

    const newStock = tipo === 'entrada' 
      ? product.stockActual + cantidadConvertida 
      : product.stockActual - cantidadConvertida;

    if (newStock < 0) {
      throw new ConflictException('Stock insuficiente');
    }

    const updatedProduct = await this.prisma.producto.update({
      where: { id },
      data: { stockActual: Math.round(newStock * 100) / 100 }, // Redondear a 2 decimales
      include: { categoria: true },
    });

    return this.formatProductWithConversions(updatedProduct);
  }

  /**
   * Obtiene resumen de inventario con ambas unidades
   */
  async getInventorySummaryWithConversions() {
    const productos = await this.prisma.producto.findMany({
      where: { esCombustible: true, activo: true },
      include: { categoria: true },
    });

    const summary = productos.map(product => {
      const conversionInfo = this.unitConversion.getConversionInfo(
        product.stockActual,
        product.unidadMedida
      );

      return {
        id: product.id,
        codigo: product.codigo,
        nombre: product.nombre,
        stockOriginal: {
          cantidad: product.stockActual,
          unidad: product.unidadMedida
        },
        stockLitros: conversionInfo.litros,
        stockGalones: conversionInfo.galones,
        valorInventario: {
          original: product.stockActual * parseFloat(product.precio.toString()),
          enLitros: conversionInfo.litros.cantidad * this.unitConversion.convert(
            parseFloat(product.precio.toString()),
            product.unidadMedida,
            'litros'
          ),
          enGalones: conversionInfo.galones.cantidad * this.unitConversion.convert(
            parseFloat(product.precio.toString()),
            product.unidadMedida,
            'galones'
          )
        }
      };
    });

    const totalLitros = summary.reduce((sum, item) => sum + item.stockLitros.cantidad, 0);
    const totalGalones = summary.reduce((sum, item) => sum + item.stockGalones.cantidad, 0);
    const valorTotalLitros = summary.reduce((sum, item) => sum + item.valorInventario.enLitros, 0);
    const valorTotalGalones = summary.reduce((sum, item) => sum + item.valorInventario.enGalones, 0);

    return {
      productos: summary,
      totales: {
        litros: {
          cantidad: Math.round(totalLitros * 100) / 100,
          unidad: 'litros',
          valor: Math.round(valorTotalLitros * 100) / 100
        },
        galones: {
          cantidad: Math.round(totalGalones * 100) / 100,
          unidad: 'galones',
          valor: Math.round(valorTotalGalones * 100) / 100
        }
      }
    };
  }
} 