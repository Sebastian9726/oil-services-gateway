import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMangueraInput } from './create-surtidor.input';

@InputType()
export class UpdateMangueraInput extends PartialType(CreateMangueraInput) {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  id?: string;
}

@InputType()
export class UpdateSurtidorInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nombre?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadMangueras?: number;

  @Field({ nullable: true })
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

  @Field(() => [UpdateMangueraInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMangueraInput)
  mangueras?: UpdateMangueraInput[];
} 