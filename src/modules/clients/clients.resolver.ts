import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { ClientsService } from './clients.service';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteInput } from './dto/create-cliente.input';
import { UpdateClienteInput } from './dto/update-cliente.input';

@Resolver(() => Cliente)
@UseGuards(JwtAuthGuard)
export class ClientsResolver {
  constructor(private readonly clientsService: ClientsService) {}

  @Mutation(() => Cliente)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente', 'empleado')
  async createClient(@Args('createClienteInput') createClienteInput: CreateClienteInput): Promise<Cliente> {
    return this.clientsService.create(createClienteInput);
  }

  @Query(() => [Cliente], { name: 'clients' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente', 'empleado')
  async findAllClients(): Promise<Cliente[]> {
    return this.clientsService.findAll();
  }

  @Query(() => Cliente, { name: 'client' })
  async findOneClient(@Args('id', { type: () => ID }) id: string): Promise<Cliente> {
    const client = await this.clientsService.findById(id);
    if (!client) {
      throw new Error('Cliente no encontrado');
    }
    return client;
  }

  @Mutation(() => Cliente)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async updateClient(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateClienteInput') updateClienteInput: UpdateClienteInput,
  ): Promise<Cliente> {
    return this.clientsService.update(id, updateClienteInput);
  }

  @Mutation(() => Cliente)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removeClient(@Args('id', { type: () => ID }) id: string): Promise<Cliente> {
    return this.clientsService.remove(id);
  }
} 