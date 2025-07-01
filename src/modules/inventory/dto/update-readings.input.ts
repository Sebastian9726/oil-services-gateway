import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

@InputType()
export class UpdateMangueraReadingsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  numeroSurtidor: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  numeroManguera: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  lecturaAnterior: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  lecturaActual: number;
} 