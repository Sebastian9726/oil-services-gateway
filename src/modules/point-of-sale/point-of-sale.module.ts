import { Module } from '@nestjs/common';
import { PointOfSaleService } from './point-of-sale.service';
import { PointOfSaleResolver } from './point-of-sale.resolver';

@Module({
  providers: [PointOfSaleService, PointOfSaleResolver],
  exports: [PointOfSaleService],
})
export class PointOfSaleModule {} 