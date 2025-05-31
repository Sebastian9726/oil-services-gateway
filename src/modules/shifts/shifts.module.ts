import { Module } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftsResolver } from './shifts.resolver';

@Module({
  providers: [ShiftsService, ShiftsResolver],
  exports: [ShiftsService],
})
export class ShiftsModule {} 