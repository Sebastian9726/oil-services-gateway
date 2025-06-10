import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsDateString, Matches } from 'class-validator';

@InputType()
export class UpdateTurnoInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaInicio debe tener formato HH:mm (ej: 08:00, 14:30)'
  })
  horaInicio?: string;

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

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
} 