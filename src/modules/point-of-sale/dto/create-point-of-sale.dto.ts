import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsBoolean, IsArray, IsNumber, IsDateString } from 'class-validator';

@InputType()
export class CreatePointOfSaleDto {
  @Field()
  @IsString()
  codigo: string;

  @Field()
  @IsString()
  nombre: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @Field()
  @IsString()
  direccion: string;

  @Field()
  @IsString()
  ciudad: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  provincia?: string;

  @Field({ defaultValue: 'Perú' })
  @IsOptional()
  @IsString()
  pais?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  codigoPostal?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  telefono?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  telefonoMovil?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  horarioApertura?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  horarioCierre?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diasAtencion?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  coordenadasGPS?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tipoEstacion?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviciosAdicionales?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  capacidadMaxima?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  fechaApertura?: string;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @Field()
  @IsString()
  empresaId: string;
} 