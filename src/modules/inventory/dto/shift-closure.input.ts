import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsArray, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class MetodoPagoProductoInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  metodoPago: string; // "EFECTIVO", "TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA", "RUMBO", etc.

  @Field(() => Float)
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
  monto: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class VentaIndividualInput {
  @Field(() => Float)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number; // Ejemplo: 1 (una unidad)

  @Field(() => Float)
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @Min(0, { message: 'El precio unitario debe ser mayor o igual a 0' })
  precioUnitario: number;

  @Field(() => Float)
  @IsNumber({}, { message: 'El valor total debe ser un número' })
  @Min(0, { message: 'El valor total debe ser mayor o igual a 0' })
  valorTotal: number;

  @Field(() => [MetodoPagoProductoInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetodoPagoProductoInput)
  metodosPago: MetodoPagoProductoInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class ProductSaleInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El código del producto es requerido' })
  codigoProducto: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'La unidad de medida es requerida' })
  unidadMedida: string; // "unidades", "litros", "galones"

  @Field(() => [VentaIndividualInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VentaIndividualInput)
  ventasIndividuales?: VentaIndividualInput[];

  // Campos para compatibilidad con el formato anterior (opcional)
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  cantidad?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @Min(0, { message: 'El precio unitario debe ser mayor o igual a 0' })
  precioUnitario?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'El valor total debe ser un número' })
  @Min(0, { message: 'El valor total debe ser mayor o igual a 0' })
  valorTotal?: number;

  @Field(() => [MetodoPagoProductoInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetodoPagoProductoInput)
  metodosPago?: MetodoPagoProductoInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class HoseReadingInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El número de manguera es requerido' })
  numeroManguera: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El código del producto es requerido' })
  codigoProducto: string;

  @Field(() => Float)
  @IsNumber({}, { message: 'La lectura anterior debe ser un número' })
  @Min(0, { message: 'La lectura anterior debe ser mayor o igual a 0' })
  lecturaAnterior: number;

  @Field(() => Float)
  @IsNumber({}, { message: 'La lectura actual debe ser un número' })
  @Min(0, { message: 'La lectura actual debe ser mayor o igual a 0' })
  lecturaActual: number;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'La unidad de medida es requerida' })
  unidadMedida: string; // "litros" o "galones"

  @Field(() => [MetodoPagoProductoInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetodoPagoProductoInput)
  metodosPago?: MetodoPagoProductoInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class DispenserReadingInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El número de surtidor es requerido' })
  numeroSurtidor: string;

  @Field(() => [HoseReadingInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HoseReadingInput)
  mangueras: HoseReadingInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class MetodoPagoInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  metodoPago: string; // "EFECTIVO", "TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA", etc.

  @Field(() => Float)
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
  monto: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class ResumenVentasTurnoInput {
  @Field(() => Float)
  @IsNumber({}, { message: 'El total de ventas del turno debe ser un número' })
  @Min(0, { message: 'El total de ventas del turno debe ser mayor o igual a 0' })
  totalVentasTurno: number;

  @Field(() => [MetodoPagoInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetodoPagoInput)
  metodosPago: MetodoPagoInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class TankHeightReadingInput {
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
  alturaFluido: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tipoTanque?: string; // "FIJO", "CARROTANQUE"

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class CierreTurnoInput {
  @Field(() => [DispenserReadingInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispenserReadingInput)
  lecturasSurtidores: DispenserReadingInput[];

  @Field(() => [TankHeightReadingInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TankHeightReadingInput)
  lecturasTanques?: TankHeightReadingInput[];

  @Field(() => [ProductSaleInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSaleInput)
  ventasProductos?: ProductSaleInput[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'La cantidad de ventas debe ser mayor o igual a 0' })
  cantidadVentasRealizadas?: number;

  @Field()
  @IsNotEmpty({ message: 'El ID del punto de venta es requerido' })
  puntoVentaId: string;

  @Field()
  @IsNotEmpty({ message: 'La fecha y hora de inicio del turno es requerida' })
  startTime: string;

  @Field()
  @IsNotEmpty({ message: 'La fecha y hora de fin del turno es requerida' })
  finishTime: string;

  @Field(() => ResumenVentasTurnoInput)
  @ValidateNested()
  @Type(() => ResumenVentasTurnoInput)
  resumenVentas: ResumenVentasTurnoInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observacionesGenerales?: string;
}

// Keep Spanish versions for backward compatibility
export { HoseReadingInput as LecturaMangueraInput };
export { CierreTurnoInput as ShiftClosureInput }; 