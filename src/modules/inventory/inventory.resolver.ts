import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { InventoryService } from './inventory.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @Query(() => String, { name: 'inventoryOverview' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async getInventoryOverview(): Promise<string> {
    const overview = await this.inventoryService.getInventoryOverview();
    return JSON.stringify(overview);
  }

  @Query(() => String, { name: 'tankStatus' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente', 'empleado')
  async getTankStatus(): Promise<string> {
    const tanks = await this.inventoryService.getTankStatus();
    return JSON.stringify(tanks);
  }
} 