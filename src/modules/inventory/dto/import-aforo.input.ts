import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTablaAforoInput } from './create-tanque.input';

@InputType()
export class ImportAforoFromCSVInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  tanqueId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  csvData: string; // Datos CSV como string: "altura,volumen\n0,0\n10,153.94\n..."
}

@InputType()
export class BulkCreateAforoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  tanqueId: string;

  @Field(() => [CreateTablaAforoInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTablaAforoInput)
  entradas: CreateTablaAforoInput[];
}

@InputType()
export class GenerateAforoByParametersInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  tanqueId: string;

  @Field(() => Float)
  diametro: number; // En metros

  @Field(() => Float)
  alturaMaxima: number; // En metros

  @Field(() => Float, { defaultValue: 1 })
  incremento?: number; // Incremento en centímetros (default: 1cm)

  @Field({ defaultValue: 'CILINDRICO' })
  tipoTanque?: string; // Para futuras formas geométricas
} 