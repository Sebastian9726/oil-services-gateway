import { InputType, Field, Int } from '@nestjs/graphql';
import { Min, Max, IsOptional } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

@InputType()
export class SortInput {
  @Field({ nullable: true })
  @IsOptional()
  field?: string;

  @Field({ nullable: true, defaultValue: 'asc' })
  @IsOptional()
  direction?: 'asc' | 'desc' = 'asc';
} 