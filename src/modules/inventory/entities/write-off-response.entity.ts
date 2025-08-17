import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class WriteOffExpiredItemResult {
  @Field()
  codigoProducto: string;

  @Field()
  nombreProducto: string;

  @Field(() => Float)
  cantidadEliminada: number;

  @Field()
  unidadMedida: string;

  @Field(() => Float)
  stockAnterior: number;

  @Field(() => Float)
  stockActual: number;

  @Field(() => Float)
  valorPerdida: number; // Precio de compra * cantidad eliminada

  @Field()
  motivoBaja: string;

  @Field({ nullable: true })
  lote?: string;

  @Field({ nullable: true })
  fechaVencimiento?: string;

  @Field({ nullable: true })
  observaciones?: string;

  @Field()
  procesadoExitosamente: boolean;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class WriteOffExpiredProductsResponse {
  @Field(() => Int)
  totalProductosProcesados: number;

  @Field(() => Int)
  productosExitosos: number;

  @Field(() => Int)
  productosConError: number;

  @Field(() => Float)
  valorTotalPerdida: number;

  @Field()
  fechaProceso: Date;

  @Field({ nullable: true })
  responsable?: string;

  @Field({ nullable: true })
  observacionesGenerales?: string;

  @Field(() => [WriteOffExpiredItemResult])
  resultados: WriteOffExpiredItemResult[];

  @Field(() => [String])
  errores: string[];

  @Field(() => [String])
  advertencias: string[];
} 