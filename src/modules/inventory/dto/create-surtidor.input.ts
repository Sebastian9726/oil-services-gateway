import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateMangueraInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  numero: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

@InputType()
export class CreateSurtidorInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  numero: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadMangueras?: number;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  fechaInstalacion?: Date;

  @Field({ nullable: true })
  @IsOptional()
  fechaMantenimiento?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @Field(() => [CreateMangueraInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMangueraInput)
  mangueras: CreateMangueraInput[];
} 