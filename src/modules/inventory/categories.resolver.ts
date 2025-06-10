import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { CategoriesService } from './categories.service';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaInput } from './dto/create-categoria.input';
import { UpdateCategoriaInput } from './dto/update-categoria.input';

@Resolver(() => Categoria)
@UseGuards(JwtAuthGuard)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Mutation(() => Categoria)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async createCategory(@Args('createCategoriaInput') createCategoriaInput: CreateCategoriaInput): Promise<Categoria> {
    return this.categoriesService.create(createCategoriaInput);
  }

  @Query(() => [Categoria], { name: 'categories' })
  async findAll(): Promise<Categoria[]> {
    return this.categoriesService.findAll();
  }

  @Query(() => [Categoria], { name: 'activeCategories' })
  async findActive(): Promise<Categoria[]> {
    return this.categoriesService.findActive();
  }

  @Query(() => Categoria, { name: 'category' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Categoria> {
    const category = await this.categoriesService.findById(id);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }
    return category;
  }

  @Mutation(() => Categoria)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCategoriaInput') updateCategoriaInput: UpdateCategoriaInput,
  ): Promise<Categoria> {
    return this.categoriesService.update(id, updateCategoriaInput);
  }

  @Mutation(() => Categoria)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async removeCategory(@Args('id', { type: () => ID }) id: string): Promise<Categoria> {
    return this.categoriesService.remove(id);
  }

  @Mutation(() => Categoria)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async toggleCategoriaStatus(@Args('id', { type: () => ID }) id: string): Promise<Categoria> {
    return this.categoriesService.toggleCategoriaStatus(id);
  }
} 