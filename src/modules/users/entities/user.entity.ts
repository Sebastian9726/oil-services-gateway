import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
import { Rol } from './rol.entity';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @HideField()
  password: string;

  @Field()
  nombre: string;

  @Field()
  apellido: string;

  @Field({ nullable: true })
  telefono?: string;

  @Field()
  activo: boolean;

  @Field()
  emailVerified: boolean;

  @Field({ nullable: true })
  ultimoLogin?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relaciones
  @Field()
  rolId: string;

  @Field(() => Rol)
  rol: Rol;
} 