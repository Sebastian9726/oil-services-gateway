import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class HoseReadingInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  numeroManguera: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  codigoProducto: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  lecturaAnterior: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  lecturaActual: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  unidadMedida: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class DispenserReadingInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  numeroSurtidor: string;

  @Field(() => [HoseReadingInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HoseReadingInput)
  mangueras: HoseReadingInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

@InputType()
export class ShiftClosureInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  turnoId: string;

  @Field(() => [DispenserReadingInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispenserReadingInput)
  lecturasSurtidores: DispenserReadingInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observacionesGenerales?: string;
}

// Keep Spanish versions for backward compatibility
export { HoseReadingInput as LecturaMangueraInput };
export { DispenserReadingInput as LecturaSurtidorInput };
export { ShiftClosureInput as CierreTurnoInput }; 