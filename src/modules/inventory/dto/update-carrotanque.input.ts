import { InputType, Field, Float, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { CreateCarrotanqueInput } from './create-carrotanque.input';

@InputType()
export class UpdateCarrotanqueInput extends PartialType(CreateCarrotanqueInput) {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El ID es requerido' })
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nombre?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  placa?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'La capacidad total debe ser un número' })
  @Min(0, { message: 'La capacidad total debe ser mayor a 0' })
  capacidadTotal?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'El nivel actual debe ser un número' })
  @Min(0, { message: 'El nivel actual debe ser mayor o igual a 0' })
  nivelActual?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'El nivel mínimo debe ser un número' })
  @Min(0, { message: 'El nivel mínimo debe ser mayor o igual a 0' })
  nivelMinimo?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'La altura actual debe ser un número' })
  @Min(0, { message: 'La altura actual debe ser mayor o igual a 0' })
  alturaActual?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'El diámetro debe ser un número' })
  @Min(0, { message: 'El diámetro debe ser mayor a 0' })
  diametro?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'La altura máxima debe ser un número' })
  @Min(0, { message: 'La altura máxima debe ser mayor a 0' })
  alturaMaxima?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tipoCarrotanque?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  conductor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  empresa?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
} 