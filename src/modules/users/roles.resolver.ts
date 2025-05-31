import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { RolesService } from './roles.service';
import { Rol } from './entities/rol.entity';
import { CreateRolInput } from './dto/create-rol.input';
import { UpdateRolInput } from './dto/update-rol.input';

@Resolver(() => Rol)
@UseGuards(JwtAuthGuard)
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) {}

  @Mutation(() => Rol)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createRol(@Args('createRolInput') createRolInput: CreateRolInput): Promise<Rol> {
    return this.rolesService.create(createRolInput);
  }

  @Query(() => [Rol], { name: 'roles' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async findAll(): Promise<Rol[]> {
    return this.rolesService.findAll();
  }

  @Query(() => [Rol], { name: 'activeRoles' })
  async getActiveRoles(): Promise<Rol[]> {
    return this.rolesService.getActiveRoles();
  }

  @Query(() => Rol, { name: 'rol' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Rol> {
    const rol = await this.rolesService.findById(id);
    if (!rol) {
      throw new Error('Rol no encontrado');
    }
    return rol;
  }

  @Mutation(() => Rol)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateRol(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateRolInput') updateRolInput: UpdateRolInput,
  ): Promise<Rol> {
    return this.rolesService.update(id, updateRolInput);
  }

  @Mutation(() => Rol)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removeRol(@Args('id', { type: () => ID }) id: string): Promise<Rol> {
    return this.rolesService.remove(id);
  }

  @Mutation(() => Rol)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async toggleRolStatus(@Args('id', { type: () => ID }) id: string): Promise<Rol> {
    return this.rolesService.toggleRolStatus(id);
  }
} 