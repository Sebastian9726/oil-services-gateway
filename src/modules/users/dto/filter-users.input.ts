import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

@InputType()
export class FilterUsersInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  roleName?: string; // Filtrar por nombre del rol (ej: "employee", "manager", "admin")

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string; // Buscar en nombre, apellido, email o username

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean; // Filtrar por estado activo/inactivo

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean; // Filtrar por email verificado
} 