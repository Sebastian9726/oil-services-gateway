import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Rol {
  @Field(() => ID)
  id: string;

  @Field()
  nombre: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field(() => [String])
  permisos: string[];

  @Field()
  activo: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 