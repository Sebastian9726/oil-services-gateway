import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Categoria } from './categoria.entity';

@ObjectType()
export class Producto {
  @Field(() => ID)
  id: string;

  @Field()
  codigo: string;

  @Field()
  nombre: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field()
  unidadMedida: string;

  @Field(() => Float)
  precio: number;

  @Field(() => Float)
  costo: number;

  @Field(() => Float)
  utilidad: number;

  @Field(() => Float)
  margenUtilidad: number;

  @Field(() => Int)
  stockMinimo: number;

  @Field(() => Int)
  stockActual: number;

  @Field()
  esCombustible: boolean;

  @Field()
  activo: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relaciones
  @Field()
  categoriaId: string;

  @Field(() => Categoria)
  categoria: Categoria;
}

@ObjectType()
export class ProductListResponse {
  @Field(() => [Producto])
  products: Producto[];

  @Field()
  total: number;

  @Field()
  page: number;

  @Field()
  limit: number;

  @Field()
  totalPages: number;
} 