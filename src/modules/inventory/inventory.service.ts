import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
  async getInventoryOverview() {
    return {
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      inventoryValue: 0,
      message: 'Vista general de inventario - próximamente',
    };
  }

  async getTankStatus() {
    return {
      tanks: [],
      message: 'Estado de tanques - próximamente',
    };
  }
} 