import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

@InputType()
export class CreateCompanyDto {
  @Field()
  @IsString()
  rut: string;

  @Field()
  @IsString()
  razonSocial: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nombreComercial?: string;

  @Field()
  @IsString()
  nombre: string;

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
  sitioWeb?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  logo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sector?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tipoEmpresa?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  fechaConstitucion?: string;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
} 