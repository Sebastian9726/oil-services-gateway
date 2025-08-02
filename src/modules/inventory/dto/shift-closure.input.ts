import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

// Importamos el enum de métodos de pago
enum MetodoPagoEnum {
  EFECTIVO = 'EFECTIVO',
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  TARJETA_DEBITO = 'TARJETA_DEBITO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  QR = 'QR',
  CHEQUE = 'CHEQUE',
  CREDITO = 'CREDITO'
}

@InputType()
export class MetodoPagoTurnoInput {
  @Field(() => String)
  @IsEnum(MetodoPagoEnum, { message: 'Método de pago inválido' })
  metodoPago: MetodoPagoEnum;

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
  @IsNumber({}, { message: 'El total de ventas debe ser un número' })
  @Min(0, { message: 'El total de ventas debe ser mayor o igual a 0' })
  totalVentasTurno: number;

  @Field(() => [MetodoPagoTurnoInput])
  @IsArray({ message: 'Los métodos de pago deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => MetodoPagoTurnoInput)
  metodosPago: MetodoPagoTurnoInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class HoseReadingInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  numeroManguera: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  codigoProducto: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  lecturaAnterior: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  lecturaActual: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  unidadMedida: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class DispenserReadingInput {
  @Field()
  @IsString()
  @IsNotEmpty()
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
export class ShiftClosureInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  puntoVentaId: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsDate()
  startTime?: Date;

  @Field({ nullable: true })    
  @IsNotEmpty()
  @IsDate()
  finishTime: Date;

  @Field(() => [DispenserReadingInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispenserReadingInput)
  lecturasSurtidores: DispenserReadingInput[];

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
export { DispenserReadingInput as LecturaSurtidorInput };
export { ShiftClosureInput as CierreTurnoInput }; 