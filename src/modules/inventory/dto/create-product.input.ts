import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty({ message: 'El código es requerido' })
  @IsString({ message: 'El código debe ser una cadena' })
  codigo: string;

  @Field()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena' })
  nombre: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena' })
  descripcion?: string;

  @Field()
  @IsNotEmpty({ message: 'La unidad de medida es requerida' })
  @IsString({ message: 'La unidad de medida debe ser una cadena' })
  unidadMedida: string;

  @Field(() => Float)
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  precio: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'El stock mínimo debe ser un número' })
  @Min(0, { message: 'El stock mínimo debe ser mayor o igual a 0' })
  stockMinimo: number = 0;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'El stock actual debe ser un número' })
  @Min(0, { message: 'El stock actual debe ser mayor o igual a 0' })
  stockActual: number = 0;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean({ message: 'esCombustible debe ser un valor booleano' })
  esCombustible: boolean = false;

  @Field()
  @IsNotEmpty({ message: 'La categoría es requerida' })
  @IsString({ message: 'La categoría debe ser una cadena' })
  categoriaId: string;
} 