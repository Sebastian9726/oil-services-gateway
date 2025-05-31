import { InputType, PartialType } from '@nestjs/graphql';
import { CreateRolInput } from './create-rol.input';

@InputType()
export class UpdateRolInput extends PartialType(CreateRolInput) {} 