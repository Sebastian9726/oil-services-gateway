import { CreatePointOfSaleDto } from './create-point-of-sale.dto';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class UpdatePointOfSaleDto extends PartialType(CreatePointOfSaleDto) {
  @Field(() => ID)
  @IsString()
  id: string;
} 