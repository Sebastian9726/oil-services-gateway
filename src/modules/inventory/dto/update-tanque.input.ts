import { CreateTanqueInput } from './create-tanque.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsIn } from 'class-validator';

@InputType()
export class UpdateTanqueInput extends PartialType(CreateTanqueInput) {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numero?: string;

  @Field({ nullable: true })
  @IsOptional()
  capacidadTotal?: number;

  @Field({ nullable: true })
  @IsOptional()
  nivelActual?: number;

  @Field({ nullable: true })
  @IsOptional()
  nivelMinimo?: number;

  @Field({ nullable: true })
  @IsOptional()
  alturaActual?: number;

  @Field({ nullable: true })
  @IsOptional()
  diametro?: number;

  @Field({ nullable: true })
  @IsOptional()
  alturaMaxima?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tipoTanque?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsIn(['LITROS', 'GALONES'], { message: 'La unidad de medida debe ser LITROS o GALONES' })
  unidadMedida?: string;

  @Field({ nullable: true })
  @IsOptional()
  activo?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productoId?: string;
} 