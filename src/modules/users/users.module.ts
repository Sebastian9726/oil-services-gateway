import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { RolesService } from './roles.service';
import { RolesResolver } from './roles.resolver';

@Module({
  providers: [UsersService, UsersResolver, RolesService, RolesResolver],
  exports: [UsersService, RolesService],
})
export class UsersModule {} 