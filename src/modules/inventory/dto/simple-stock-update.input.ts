import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

@InputType()
export class SimpleStockUpdateInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  codigoProducto: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  cantidad: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  unidadMedida: string; // "galones" o "litros"

  @Field()
  @IsString()
  @IsNotEmpty()
  tipo: 'entrada' | 'salida';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
} 