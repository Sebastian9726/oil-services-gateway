import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, Matches } from 'class-validator';

@InputType()
export class CreateShiftInput {
  @Field()
  @IsDateString()
  @IsNotEmpty()
  startDate: string; // ISO string format

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must have HH:mm format (e.g.: 08:00, 14:30)'
  })
  startTime: string; // "08:00", "14:00", etc.

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must have HH:mm format (e.g.: 14:00, 22:30)'
  })
  endTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observations?: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
} 