import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

@InputType()
export class CreateCarrotanqueInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'La placa es requerida' })
  placa: string;

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

  @Field({ defaultValue: 'GALONES' })
  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @Field({ defaultValue: true })
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

@InputType()
export class CreateTablaAforoCarrotanqueInput {
  @Field(() => Float)
  @IsNumber({}, { message: 'La altura debe ser un número' })
  @Min(0, { message: 'La altura debe ser mayor o igual a 0' })
  altura: number;

  @Field(() => Float)
  @IsNumber({}, { message: 'El volumen debe ser un número' })
  @Min(0, { message: 'El volumen debe ser mayor o igual a 0' })
  volumen: number;
}

@InputType()
export class FilterCarrotanquesInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  empresa?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  conductor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  placa?: string;
} 