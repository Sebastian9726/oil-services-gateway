import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateCategoriaInput } from './dto/create-categoria.input';
import { UpdateCategoriaInput } from './dto/update-categoria.input';
import { Categoria } from './entities/categoria.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoriaInput: CreateCategoriaInput): Promise<Categoria> {
    // Verificar si el nombre ya existe
    const existingCategoria = await this.prisma.categoria.findUnique({
      where: { nombre: createCategoriaInput.nombre },
    });

    if (existingCategoria) {
      throw new ConflictException('El nombre de la categoría ya está en uso');
    }

    const categoria = await this.prisma.categoria.create({
      data: createCategoriaInput,
    });

    return categoria as Categoria;
  }

  async findAll(): Promise<Categoria[]> {
    const categorias = await this.prisma.categoria.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    return categorias as Categoria[];
  }

  async findById(id: string): Promise<Categoria | null> {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });

    return categoria as Categoria | null;
  }

  async findByName(nombre: string): Promise<Categoria | null> {
    const categoria = await this.prisma.categoria.findUnique({
      where: { nombre },
    });

    return categoria as Categoria | null;
  }

  async findActive(): Promise<Categoria[]> {
    const categorias = await this.prisma.categoria.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });

    return categorias as Categoria[];
  }

  async update(id: string, updateCategoriaInput: UpdateCategoriaInput): Promise<Categoria> {
    const existingCategoria = await this.findById(id);
    
    if (!existingCategoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Si se está actualizando el nombre, verificar que no exista
    if (updateCategoriaInput.nombre && updateCategoriaInput.nombre !== existingCategoria.nombre) {
      const nombreExists = await this.prisma.categoria.findUnique({
        where: { nombre: updateCategoriaInput.nombre },
      });

      if (nombreExists) {
        throw new ConflictException('El nombre de la categoría ya está en uso');
      }
    }

    const categoria = await this.prisma.categoria.update({
      where: { id },
      data: updateCategoriaInput,
    });

    return categoria as Categoria;
  }

  async remove(id: string): Promise<Categoria> {
    const existingCategoria = await this.findById(id);
    
    if (!existingCategoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar si hay productos con esta categoría
    const productsWithCategory = await this.prisma.producto.count({
      where: { categoriaId: id },
    });

    if (productsWithCategory > 0) {
      throw new ConflictException('No se puede eliminar la categoría porque tiene productos asignados');
    }

    const categoria = await this.prisma.categoria.delete({
      where: { id },
    });

    return categoria as Categoria;
  }

  async toggleCategoriaStatus(id: string): Promise<Categoria> {
    const categoria = await this.findById(id);
    
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const updatedCategoria = await this.prisma.categoria.update({
      where: { id },
      data: { activo: !categoria.activo },
    });

    return updatedCategoria as Categoria;
  }

  async getCategoriesWithProductCount() {
    const categorias = await this.prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return categorias.map(categoria => ({
      ...categoria,
      productCount: categoria._count.productos,
    }));
  }
} 