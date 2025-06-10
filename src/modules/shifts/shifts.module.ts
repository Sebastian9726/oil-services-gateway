import { Module } from '@nestjs/common';
import { PrismaModule } from '../../config/prisma/prisma.module';
import { ShiftsService } from './shifts.service';
import { ShiftsResolver } from './shifts.resolver';

@Module({
  imports: [PrismaModule],
  providers: [ShiftsService, ShiftsResolver],
  exports: [ShiftsService],
})
export class ShiftsModule {} 