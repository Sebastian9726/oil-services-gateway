import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class WriteOffExpiredItemInput {

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El id del producto es requerido' })
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El código del producto es requerido' })
  codigoProducto: string;

  @Field(() => Float)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'La unidad de medida es requerida' })
  unidadMedida: string; // "unidades", "litros", "galones"

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lote?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha válida' })
  fechaVencimiento?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  motivoBaja?: string; // "VENCIMIENTO", "DETERIORO", "DAÑO", "CONTAMINACION"

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class WriteOffExpiredProductsInput {
  @Field(() => [WriteOffExpiredItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WriteOffExpiredItemInput)
  productos: WriteOffExpiredItemInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observacionesGenerales?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  responsable?: string;
} 