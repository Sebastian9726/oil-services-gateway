import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Producto } from './producto.entity';

@ObjectType()
export class MangueraSurtidor {
  @Field(() => ID)
  id: string;

  @Field()
  numero: string;

  @Field({ nullable: true })
  color?: string;

  @Field()
  activo: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ID)
  surtidorId: string;

  @Field(() => ID)
  productoId: string;

  @Field(() => Producto)
  producto: Producto;
} 