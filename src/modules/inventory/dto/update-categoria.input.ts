import { InputType, PartialType } from '@nestjs/graphql';
import { CreateCategoriaInput } from './create-categoria.input';

@InputType()
export class UpdateCategoriaInput extends PartialType(CreateCategoriaInput) {} 