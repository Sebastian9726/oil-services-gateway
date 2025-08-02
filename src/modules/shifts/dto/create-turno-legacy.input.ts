import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, Matches } from 'class-validator';

@InputType()
export class CreateTurnoInput {
  @Field()
  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string; // ISO string format

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaInicio debe tener formato HH:mm (ej: 08:00, 14:30)'
  })
  horaInicio: string; // "08:00", "14:00", etc.

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaFin debe tener formato HH:mm (ej: 14:00, 22:30)'
  })
  horaFin?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  usuarioId: string;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  puntoVentaId: string;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
} 