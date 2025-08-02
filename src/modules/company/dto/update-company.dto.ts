import { CreateCompanyDto } from './create-company.dto';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @Field(() => ID)
  @IsString()
  id: string;
} 