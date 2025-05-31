import { Injectable } from '@nestjs/common';

@Injectable()
export class SalesService {
  async findAll() {
    return 'Módulo de ventas - próximamente';
  }

  async getSalesStats() {
    return {
      totalSales: 0,
      todaySales: 0,
      message: 'Estadísticas básicas de ventas - próximamente',
    };
  }
} 