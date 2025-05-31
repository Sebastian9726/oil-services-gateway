import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

@InputType()
export class CreateRolInput {
  @Field()
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena' })
  nombre: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena' })
  descripcion?: string;

  @Field(() => [String])
  @IsArray({ message: 'Los permisos deben ser un array' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena' })
  permisos: string[];
} 