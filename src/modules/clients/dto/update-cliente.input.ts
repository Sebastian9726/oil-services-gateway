import { InputType, PartialType } from '@nestjs/graphql';
import { CreateClienteInput } from './create-cliente.input';

@InputType()
export class UpdateClienteInput extends PartialType(CreateClienteInput) {} 