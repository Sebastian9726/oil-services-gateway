import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { MangueraSurtidor } from './manguera-surtidor.entity';
import { PointOfSale } from '../../point-of-sale/entities/point-of-sale.entity';

@ObjectType()
export class Surtidor {
  @Field(() => ID)
  id: string;

  @Field()
  numero: string;

  @Field()
  nombre: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field({ nullable: true })
  ubicacion?: string;

  @Field(() => Int)
  cantidadMangueras: number;

  @Field()
  activo: boolean;

  @Field({ nullable: true })
  fechaInstalacion?: Date;

  @Field({ nullable: true })
  fechaMantenimiento?: Date;

  @Field({ nullable: true })
  observaciones?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [MangueraSurtidor])
  mangueras: MangueraSurtidor[];

  @Field(() => PointOfSale)
  puntoVenta: PointOfSale;
}

@ObjectType()
export class SurtidorListResponse {
  @Field(() => [Surtidor])
  surtidores: Surtidor[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
} 