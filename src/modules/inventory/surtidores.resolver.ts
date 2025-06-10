import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SurtidoresService } from './surtidores.service';
import { Surtidor, SurtidorListResponse } from './entities/surtidor.entity';
import { CreateSurtidorInput } from './dto/create-surtidor.input';
import { UpdateSurtidorInput } from './dto/update-surtidor.input';

@Resolver(() => Surtidor)
@UseGuards(JwtAuthGuard)
export class SurtidoresResolver {
  constructor(private readonly surtidoresService: SurtidoresService) {}

  @Mutation(() => Surtidor)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async createSurtidor(@Args('createSurtidorInput') createSurtidorInput: CreateSurtidorInput): Promise<Surtidor> {
    return this.surtidoresService.create(createSurtidorInput);
  }

  @Query(() => SurtidorListResponse, { name: 'surtidores' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async findAllSurtidores(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('activo', { type: () => Boolean, nullable: true }) activo?: boolean,
  ): Promise<SurtidorListResponse> {
    return this.surtidoresService.findAll(page, limit, activo);
  }

  @Query(() => Surtidor, { name: 'surtidor' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async findOneSurtidor(@Args('id', { type: () => ID }) id: string): Promise<Surtidor> {
    return this.surtidoresService.findOne(id);
  }

  @Query(() => Surtidor, { name: 'surtidorByNumber', nullable: true })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async findSurtidorByNumber(@Args('numero') numero: string): Promise<Surtidor | null> {
    return this.surtidoresService.findByNumero(numero);
  }

  @Mutation(() => Surtidor)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async updateSurtidor(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateSurtidorInput') updateSurtidorInput: UpdateSurtidorInput,
  ): Promise<Surtidor> {
    return this.surtidoresService.update(id, updateSurtidorInput);
  }

  @Mutation(() => Surtidor)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removeSurtidor(@Args('id', { type: () => ID }) id: string): Promise<Surtidor> {
    return this.surtidoresService.remove(id);
  }
} 