import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryResolver } from './inventory.resolver';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { CategoriesService } from './categories.service';
import { CategoriesResolver } from './categories.resolver';

@Module({
  providers: [
    InventoryService,
    InventoryResolver,
    ProductsService,
    ProductsResolver,
    CategoriesService,
    CategoriesResolver,
  ],
  exports: [InventoryService, ProductsService, CategoriesService],
})
export class InventoryModule {} 