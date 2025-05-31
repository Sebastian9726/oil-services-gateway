import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Categoria } from './categoria.entity';

@ObjectType()
export class ProductoConversion {
  @Field(() => Float)
  cantidad: number;

  @Field()
  unidad: string;

  @Field()
  formatted: string;
}

@ObjectType()
export class ProductoWithConversions {
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

  // Conversiones automáticas para combustibles
  @Field(() => ProductoConversion, { nullable: true })
  stockEnLitros?: ProductoConversion;

  @Field(() => ProductoConversion, { nullable: true })
  stockEnGalones?: ProductoConversion;

  @Field(() => Float, { nullable: true })
  precioLitro?: number;

  @Field(() => Float, { nullable: true })
  precioGalon?: number;
} 