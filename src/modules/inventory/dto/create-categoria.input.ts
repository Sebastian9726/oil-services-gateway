import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateCategoriaInput {
  @Field()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena' })
  nombre: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena' })
  descripcion?: string;
} 