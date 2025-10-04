import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class TankMovementInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El ID del tanque es requerido' })
  tanqueId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nombreTanque?: string;

  @Field(() => Float)
  @IsNumber({}, { message: 'La altura del fluido debe ser un número' })
  @Min(0, { message: 'La altura del fluido debe ser mayor o igual a 0' })
  alturaFluidoAnterior: number; // Altura antes del ingreso

  @Field(() => Float)
  @IsNumber({}, { message: 'La altura del fluido debe ser un número' })
  @Min(0, { message: 'La altura del fluido debe ser mayor o igual a 0' })
  alturaFluidoNueva: number; // Altura después del ingreso

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  codigoProducto?: string; // Código del producto/combustible

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'El precio de compra debe ser un número' })
  @Min(0, { message: 'El precio de compra debe ser mayor o igual a 0' })
  precioCompra?: number; // Precio por litro del combustible

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lote?: string; // Número de lote

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fechaVencimiento?: string; // Fecha de vencimiento

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class ProductMovementInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El código del producto es requerido' })
  codigoProducto: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'La unidad de medida es requerida' })
  unidadMedida: string; // "unidades", "litros", "galones"

  @Field(() => Float)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  cantidadIngresada: number;

  @Field(() => Float)
  @IsNumber({}, { message: 'El precio de compra debe ser un número' })
  @Min(0, { message: 'El precio de compra debe ser mayor o igual a 0' })
  precioCompra: number; // Precio unitario de compra

  @Field(() => Float)
  @IsNumber({}, { message: 'El costo total debe ser un número' })
  @Min(0, { message: 'El costo total debe ser mayor o igual a 0' })
  costoTotal: number; // cantidadIngresada * precioCompra

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lote?: string; // Número de lote del producto

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fechaVencimiento?: string; // Fecha de vencimiento del producto

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class CarrotanqueMovementInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El ID del carrotanque es requerido' })
  carrotanqueId: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El código del producto es requerido' })
  codigoProducto: string;

  @Field(() => Float)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  cantidadDescargada: number; // En galones/litros

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'La unidad de medida es requerida' })
  unidadMedida: string; // "galones", "litros"

  @Field(() => Float)
  @IsNumber({}, { message: 'El precio de compra debe ser un número' })
  @Min(0, { message: 'El precio de compra debe ser mayor o igual a 0' })
  precioCompra: number; // Precio por galón/litro

  @Field(() => Float)
  @IsNumber({}, { message: 'El costo total debe ser un número' })
  @Min(0, { message: 'El costo total debe ser mayor o igual a 0' })
  costoTotal: number; // cantidadDescargada * precioCompra

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numeroRemision?: string; // Número de remisión

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lote?: string; // Número de lote

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fechaVencimiento?: string; // Fecha de vencimiento

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class InventoryProcessInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El ID del punto de venta es requerido' })
  puntoVentaId: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El tipo de entrada es requerido' })
  tipoEntrada: string; // "compra", "transferencia", "ajuste", "descarga_carrotanque"

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  responsable?: string; // Persona responsable del ingreso

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  proveedor?: string; // Proveedor general

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numeroFactura?: string; // Número de factura general

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numeroRemision?: string; // Para carrotanques

  @Field(() => [TankMovementInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TankMovementInput)
  movimientosTanques?: TankMovementInput[]; // Movimientos en tanques

  @Field(() => [ProductMovementInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMovementInput)
  movimientosProductos?: ProductMovementInput[]; // Movimientos de productos

  @Field(() => [CarrotanqueMovementInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarrotanqueMovementInput)
  movimientosCarrotanques?: CarrotanqueMovementInput[]; // Movimientos de carrotanques

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'El costo total debe ser un número' })
  @Min(0, { message: 'El costo total debe ser mayor o igual a 0' })
  costoTotalProceso?: number; // Costo total de todo el proceso

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observacionesGenerales?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fechaFin?: string; // Fecha de finalización del proceso
}
