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
  @Roles('admin', 'gerente')
  async createCategoria(@Args('createCategoriaInput') createCategoriaInput: CreateCategoriaInput): Promise<Categoria> {
    return this.categoriesService.create(createCategoriaInput);
  }

  @Query(() => [Categoria], { name: 'categories' })
  async findAllCategories(): Promise<Categoria[]> {
    return this.categoriesService.findAll();
  }

  @Query(() => [Categoria], { name: 'activeCategories' })
  async findActiveCategories(): Promise<Categoria[]> {
    return this.categoriesService.findActive();
  }

  @Query(() => Categoria, { name: 'category' })
  async findOneCategory(@Args('id', { type: () => ID }) id: string): Promise<Categoria> {
    const category = await this.categoriesService.findById(id);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }
    return category;
  }

  @Mutation(() => Categoria)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async updateCategoria(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCategoriaInput') updateCategoriaInput: UpdateCategoriaInput,
  ): Promise<Categoria> {
    return this.categoriesService.update(id, updateCategoriaInput);
  }

  @Mutation(() => Categoria)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removeCategoria(@Args('id', { type: () => ID }) id: string): Promise<Categoria> {
    return this.categoriesService.remove(id);
  }

  @Mutation(() => Categoria)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async toggleCategoriaStatus(@Args('id', { type: () => ID }) id: string): Promise<Categoria> {
    return this.categoriesService.toggleCategoriaStatus(id);
  }
} 