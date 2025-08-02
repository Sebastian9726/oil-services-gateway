import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateTablaAforoInput {
  @Field(() => Float)
  @IsNumber({}, { message: 'La altura debe ser un número' })
  @Min(0, { message: 'La altura debe ser mayor o igual a 0' })
  altura: number; // En centímetros

  @Field(() => Float)
  @IsNumber({}, { message: 'El volumen debe ser un número' })
  @Min(0, { message: 'El volumen debe ser mayor o igual a 0' })
  volumen: number; // En litros
}

@InputType()
export class CreateTanqueInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  numero: string;

  @Field(() => Float)
  @IsNumber({}, { message: 'La capacidad total debe ser un número' })
  @Min(0, { message: 'La capacidad total debe ser mayor a 0' })
  capacidadTotal: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'El nivel actual debe ser un número' })
  @Min(0, { message: 'El nivel actual debe ser mayor o igual a 0' })
  nivelActual?: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'El nivel mínimo debe ser un número' })
  @Min(0, { message: 'El nivel mínimo debe ser mayor o igual a 0' })
  nivelMinimo?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'El diámetro debe ser un número' })
  @Min(0, { message: 'El diámetro debe ser mayor a 0' })
  diametro?: number; // En metros

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'La altura máxima debe ser un número' })
  @Min(0, { message: 'La altura máxima debe ser mayor a 0' })
  alturaMaxima?: number; // En metros

  @Field({ nullable: true, defaultValue: 'CILINDRICO' })
  @IsOptional()
  @IsString()
  tipoTanque?: string;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @Field()
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  puntoVentaId: string;

  @Field(() => [CreateTablaAforoInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTablaAforoInput)
  tablaAforo?: CreateTablaAforoInput[];

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  generarTablaAforoAutomatica?: boolean; // Si es true, genera la tabla basada en diámetro y altura
} 