import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Cliente {
  @Field(() => ID)
  id: string;

  @Field()
  tipoDocumento: string;

  @Field()
  numeroDocumento: string;

  @Field()
  nombre: string;

  @Field()
  apellido: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  telefono?: string;

  @Field({ nullable: true })
  direccion?: string;

  @Field()
  activo: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 