import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { ReportsService } from './reports.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Query(() => String, { name: 'dashboard' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async getDashboard(): Promise<string> {
    const dashboard = await this.reportsService.getDashboard();
    return JSON.stringify(dashboard);
  }

  @Query(() => String, { name: 'dailySalesReport' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async getDailySales(): Promise<string> {
    const report = await this.reportsService.getDailySales();
    return JSON.stringify(report);
  }
} 