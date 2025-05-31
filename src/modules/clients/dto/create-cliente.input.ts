import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

@InputType()
export class CreateClienteInput {
  @Field()
  @IsNotEmpty({ message: 'El tipo de documento es requerido' })
  @IsString({ message: 'El tipo de documento debe ser una cadena' })
  tipoDocumento: string;

  @Field()
  @IsNotEmpty({ message: 'El número de documento es requerido' })
  @IsString({ message: 'El número de documento debe ser una cadena' })
  numeroDocumento: string;

  @Field()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena' })
  nombre: string;

  @Field()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser una cadena' })
  apellido: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena' })
  telefono?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena' })
  direccion?: string;
} 