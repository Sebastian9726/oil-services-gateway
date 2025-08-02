import { InputType, Field, ID, PartialType, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { CreateTanqueInput } from './create-tanque.input';

@InputType()
export class UpdateTanqueInput extends PartialType(CreateTanqueInput) {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numero?: string;

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
  tipoTanque?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productoId?: string;
} 