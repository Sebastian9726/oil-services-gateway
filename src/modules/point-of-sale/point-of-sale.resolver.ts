import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { PointOfSaleService } from './point-of-sale.service';
import { PointOfSale } from './entities/point-of-sale.entity';
import { CreatePointOfSaleDto } from './dto/create-point-of-sale.dto';
import { UpdatePointOfSaleDto } from './dto/update-point-of-sale.dto';

@Resolver(() => PointOfSale)
@UseGuards(JwtAuthGuard)
export class PointOfSaleResolver {
  constructor(private readonly pointOfSaleService: PointOfSaleService) {}

  @Mutation(() => PointOfSale)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createPointOfSale(@Args('createPointOfSaleInput') createPointOfSaleDto: CreatePointOfSaleDto): Promise<PointOfSale> {
    return this.pointOfSaleService.create(createPointOfSaleDto);
  }

  @Query(() => [PointOfSale], { name: 'pointsOfSale' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async findAll(): Promise<PointOfSale[]> {
    return this.pointOfSaleService.findAll();
  }

  @Query(() => [PointOfSale], { name: 'pointsOfSaleByCompany' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async findByCompany(@Args('empresaId') empresaId: string): Promise<PointOfSale[]> {
    return this.pointOfSaleService.findByCompany(empresaId);
  }

  @Query(() => PointOfSale, { name: 'pointOfSale' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<PointOfSale> {
    const pointOfSale = await this.pointOfSaleService.findById(id);
    if (!pointOfSale) {
      throw new Error('Punto de venta no encontrado');
    }
    return pointOfSale;
  }

  @Query(() => PointOfSale, { name: 'pointOfSaleByCodigo' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async findByCodigo(@Args('codigo') codigo: string): Promise<PointOfSale> {
    const pointOfSale = await this.pointOfSaleService.findByCodigo(codigo);
    if (!pointOfSale) {
      throw new Error('Punto de venta no encontrado');
    }
    return pointOfSale;
  }

  @Mutation(() => PointOfSale)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updatePointOfSale(@Args('updatePointOfSaleInput') updatePointOfSaleDto: UpdatePointOfSaleDto): Promise<PointOfSale> {
    return this.pointOfSaleService.update(updatePointOfSaleDto);
  }

  @Mutation(() => PointOfSale)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removePointOfSale(@Args('id', { type: () => ID }) id: string): Promise<PointOfSale> {
    return this.pointOfSaleService.remove(id);
  }

  @Mutation(() => PointOfSale)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async togglePointOfSaleStatus(@Args('id', { type: () => ID }) id: string): Promise<PointOfSale> {
    return this.pointOfSaleService.toggleStatus(id);
  }
} 