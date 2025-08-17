import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryResolver } from './inventory.resolver';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { CategoriesService } from './categories.service';
import { CategoriesResolver } from './categories.resolver';
import { SurtidoresService } from './surtidores.service';
import { SurtidoresResolver } from './surtidores.resolver';
import { TanquesService } from './tanques.service';
import { TanquesResolver } from './tanques.resolver';
import { CarrotanquesService } from './carrotanques.service';
import { CarrotanquesResolver } from './carrotanques.resolver';
import { MetodosPagoResolver } from './metodos-pago.resolver';

@Module({
  providers: [
    InventoryService,
    InventoryResolver,
    ProductsService,
    ProductsResolver,
    CategoriesService,
    CategoriesResolver,
    SurtidoresService,
    SurtidoresResolver,
    TanquesService,
    TanquesResolver,
    CarrotanquesService,
    CarrotanquesResolver,
    MetodosPagoResolver,
  ],
  exports: [InventoryService, ProductsService, CategoriesService, SurtidoresService, TanquesService, CarrotanquesService],
})
export class InventoryModule {} 