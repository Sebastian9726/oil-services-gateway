import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  async getDashboard() {
    return {
      message: 'Módulo de reportes - próximamente',
      dailySalesReport: 'Reporte de ventas diarias',
      inventoryReport: 'Reporte de inventario',
      timestamp: new Date().toISOString(),
    };
  }

  async getDailySales() {
    return {
      message: 'Reportes de ventas diarias - próximamente',
      data: [],
    };
  }
} 