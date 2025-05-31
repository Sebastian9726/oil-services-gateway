import { Injectable } from '@nestjs/common';

@Injectable()
export class ShiftsService {
  async findAll() {
    return 'Módulo de turnos - próximamente';
  }

  async getActiveShifts() {
    return {
      activeShifts: 0,
      message: 'Turnos activos básicos - próximamente',
    };
  }
} 