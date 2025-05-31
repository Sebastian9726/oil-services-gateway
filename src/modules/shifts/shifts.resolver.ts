import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { ShiftsService } from './shifts.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ShiftsResolver {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Query(() => String, { name: 'shifts' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async findAllShifts(): Promise<string> {
    return this.shiftsService.findAll();
  }

  @Query(() => String, { name: 'activeShifts' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente', 'empleado')
  async getActiveShifts(): Promise<string> {
    const shifts = await this.shiftsService.getActiveShifts();
    return JSON.stringify(shifts);
  }
} 