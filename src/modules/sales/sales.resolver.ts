import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { SalesService } from './sales.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class SalesResolver {
  constructor(private readonly salesService: SalesService) {}

  @Query(() => String, { name: 'sales' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente', 'empleado')
  async findAllSales(): Promise<string> {
    return this.salesService.findAll();
  }

  @Query(() => String, { name: 'salesStats' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async getSalesStats(): Promise<string> {
    const stats = await this.salesService.getSalesStats();
    return JSON.stringify(stats);
  }
} 