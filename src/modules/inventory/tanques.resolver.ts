import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { TanquesService } from './tanques.service';
import { Tanque, TanqueWithStatus, TanqueUpdateResponse } from './entities/tanque.entity';
import { CreateTanqueInput, CreateTablaAforoInput } from './dto/create-tanque.input';
import { UpdateTanqueInput } from './dto/update-tanque.input';

@Resolver(() => Tanque)
@UseGuards(JwtAuthGuard)
export class TanquesResolver {
  constructor(private readonly tanquesService: TanquesService) {}

  @Mutation(() => Tanque)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async createTank(@Args('createTankInput') createTankInput: CreateTanqueInput): Promise<Tanque> {
    return this.tanquesService.create(createTankInput);
  }

  @Query(() => [Tanque], { name: 'tanques' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async findAllTanques(
    @Args('puntoVentaId', { type: () => ID, nullable: true }) puntoVentaId?: string,
    @Args('productoId', { type: () => ID, nullable: true }) productoId?: string,
    @Args('activo', { nullable: true }) activo?: boolean,
  ): Promise<Tanque[]> {
    return this.tanquesService.findAll(puntoVentaId, productoId, activo);
  }

  @Query(() => Tanque, { name: 'tanque' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async findOneTanque(@Args('id', { type: () => ID }) id: string): Promise<Tanque> {
    return this.tanquesService.findOne(id);
  }

  @Query(() => [Tanque], { name: 'tanquesByPuntoVenta' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async findTanquesByPuntoVenta(
    @Args('puntoVentaId', { type: () => ID }) puntoVentaId: string
  ): Promise<Tanque[]> {
    return this.tanquesService.findByPuntoVenta(puntoVentaId);
  }

  @Query(() => [TanqueWithStatus], { name: 'tankStatusByPuntoVenta' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getTankStatusByPuntoVenta(
    @Args('puntoVentaId', { type: () => ID }) puntoVentaId: string
  ): Promise<TanqueWithStatus[]> {
    return this.tanquesService.getTankStatusByPuntoVenta(puntoVentaId);
  }

  @Mutation(() => Tanque)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async updateTanque(@Args('updateTanqueInput') updateTanqueInput: UpdateTanqueInput): Promise<Tanque> {
    return this.tanquesService.update(updateTanqueInput.id, updateTanqueInput);
  }

  @Mutation(() => Tanque)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async updateTankLevel(
    @Args('id', { type: () => ID }) id: string,
    @Args('nuevoNivel', { type: () => Float }) nuevoNivel: number
  ): Promise<Tanque> {
    return this.tanquesService.updateLevel(id, nuevoNivel);
  }

  @Mutation(() => TanqueUpdateResponse)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async updateTankLevelByHeight(
    @Args('id', { type: () => ID }) id: string,
    @Args('alturaFluido', { type: () => Float }) alturaFluido: number
  ): Promise<TanqueUpdateResponse> {
    return this.tanquesService.updateLevelByHeight(id, alturaFluido);
  }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removeTanque(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.tanquesService.remove(id);
  }

  @Query(() => Float, { name: 'calculateVolumeByHeight' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async calculateVolumeByHeight(
    @Args('diametro', { type: () => Float }) diametro: number,
    @Args('altura', { type: () => Float }) altura: number
  ): Promise<number> {
    return this.tanquesService.calculateVolumeByHeight(diametro, altura);
  }

  @Query(() => Float, { name: 'getVolumeByHeightFromTable' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getVolumeByHeight(
    @Args('tanqueId', { type: () => ID }) tanqueId: string,
    @Args('altura', { type: () => Float }) altura: number
  ): Promise<number> {
    return this.tanquesService.getVolumeByHeight(tanqueId, altura);
  }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async generateAutomaticGaugeTable(
    @Args('tanqueId', { type: () => ID }) tanqueId: string,
    @Args('diametro', { type: () => Float }) diametro: number,
    @Args('alturaMaxima', { type: () => Float }) alturaMaxima: number
  ): Promise<boolean> {
    await this.tanquesService.generarTablaAforoAutomatica(tanqueId, diametro, alturaMaxima);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async bulkCreateAforo(
    @Args('tanqueId', { type: () => ID }) tanqueId: string,
    @Args('entradas', { type: () => [CreateTablaAforoInput] }) entradas: CreateTablaAforoInput[]
  ): Promise<boolean> {
    await this.tanquesService.bulkCreateAforo(tanqueId, entradas);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async importAforoFromCSV(
    @Args('tanqueId', { type: () => ID }) tanqueId: string,
    @Args('csvData', { type: () => String }) csvData: string
  ): Promise<boolean> {
    await this.tanquesService.importAforoFromCSV(tanqueId, csvData);
    return true;
  }
} 