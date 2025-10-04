import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class InventoryMovementResult {
  @Field()
  id: string;

  @Field()
  procesoId: string;

  @Field(() => Float)
  cantidad: number;

  @Field()
  unidadMedida: string;

  @Field()
  tipoMovimiento: string;

  @Field(() => Float, { nullable: true })
  precioUnitario?: number;

  @Field(() => Float, { nullable: true })
  costoTotal?: number;

  @Field({ nullable: true })
  codigoProducto?: string;

  @Field({ nullable: true })
  lote?: string;

  @Field({ nullable: true })
  fechaVencimiento?: string;

  @Field(() => Float, { nullable: true })
  alturaFluidoAnterior?: number;

  @Field(() => Float, { nullable: true })
  alturaFluidoNueva?: number;

  @Field(() => Float, { nullable: true })
  volumenCalculado?: number;

  @Field()
  estadoMovimiento: string;

  @Field({ nullable: true })
  observaciones?: string;

  @Field({ nullable: true })
  mensajeError?: string;

  @Field()
  fechaMovimiento: string;

  @Field({ nullable: true })
  productoId?: string;

  @Field({ nullable: true })
  tanqueId?: string;

  @Field({ nullable: true })
  carrotanqueId?: string;
}

@ObjectType()
export class InventoryProcessResult {
  @Field()
  id: string;

  @Field()
  puntoVentaId: string;

  @Field()
  tipoEntrada: string;

  @Field()
  codigoProceso: string;

  @Field({ nullable: true })
  responsable?: string;

  @Field()
  estado: string;

  @Field()
  fechaInicio: string;

  @Field({ nullable: true })
  fechaFin?: string;

  @Field(() => Float, { nullable: true })
  costoTotalProceso?: number;

  @Field({ nullable: true })
  proveedor?: string;

  @Field({ nullable: true })
  numeroFactura?: string;

  @Field({ nullable: true })
  numeroRemision?: string;

  @Field({ nullable: true })
  observacionesGenerales?: string;

  @Field(() => Int)
  totalMovimientos: number;

  @Field(() => Int)
  movimientosExitosos: number;

  @Field(() => Int)
  movimientosConError: number;

  @Field(() => [InventoryMovementResult])
  movimientos: InventoryMovementResult[];
}

@ObjectType()
export class InventoryProcessResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => InventoryProcessResult, { nullable: true })
  proceso?: InventoryProcessResult;

  @Field(() => [String], { nullable: true })
  errores?: string[];

  @Field(() => [String], { nullable: true })
  advertencias?: string[];
}
