import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<User> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  @Query(() => User, { name: 'me' })
  async getCurrentUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Mutation(() => User)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(id, updateUserInput);
  }

  @Mutation(() => User)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removeUser(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.remove(id);
  }

  @Mutation(() => User)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async toggleUserStatus(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.toggleUserStatus(id);
  }

  @Mutation(() => Boolean)
  async changePassword(
    @CurrentUser() user: User,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return this.usersService.changePassword(user.id, newPassword);
  }
} 