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
    return {
      ...product,
      precio: parseFloat(product.precio.toString()),
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

  async findAll(): Promise<Producto[]> {
    const productos = await this.prisma.producto.findMany({
      include: { categoria: true },
      orderBy: { createdAt: 'desc' },
    });

    return this.formatProducts(productos);
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
} 