import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsDateString, Matches } from 'class-validator';

@InputType()
export class UpdateShiftInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must have HH:mm format (e.g.: 08:00, 14:30)'
  })
  startTime?: string;

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
  @IsOptional()
  @IsString()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
} 