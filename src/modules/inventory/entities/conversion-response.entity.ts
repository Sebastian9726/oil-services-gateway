import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Categoria } from './categoria.entity';

@ObjectType()
export class StockConversion {
  @Field(() => Float)
  cantidad: number;

  @Field()
  unidad: string;

  @Field()
  formatted: string;
}

@ObjectType()
export class Equivalencias {
  @Field()
  litro_a_galones: string;

  @Field()
  galon_a_litros: string;
}

@ObjectType()
export class ProductWithConversionsResponse {
  @Field(() => ID)
  id: string;

  @Field()
  codigo: string;

  @Field()
  nombre: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field()
  unidadMedida: string;

  @Field(() => Float)
  precioVenta: number;

  @Field(() => Int)
  stockMinimo: number;

  @Field(() => Int)
  stockActual: number;

  @Field()
  esCombustible: boolean;

  @Field()
  activo: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  categoriaId: string;

  @Field(() => Categoria)
  categoria: Categoria;

  // Conversiones
  @Field(() => StockConversion)
  stockEnLitros: StockConversion;

  @Field(() => StockConversion)
  stockEnGalones: StockConversion;

  @Field(() => Float)
  precioLitro: number;

  @Field(() => Float)
  precioGalon: number;

  @Field(() => Equivalencias, { nullable: true })
  equivalencias?: Equivalencias;
}

@ObjectType()
export class TotalesInventario {
  @Field(() => Float)
  totalLitros: number;

  @Field(() => Float)
  totalGalones: number;

  @Field(() => Float)
  valorTotalLitros: number;

  @Field(() => Float)
  valorTotalGalones: number;
}

@ObjectType()
export class InventorySummaryResponse {
  @Field(() => [ProductWithConversionsResponse])
  productos: ProductWithConversionsResponse[];

  @Field(() => TotalesInventario)
  totales: TotalesInventario;

  @Field()
  fechaConsulta: Date;

  @Field(() => Int)
  totalProductos: number;
} 