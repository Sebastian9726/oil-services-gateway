import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Producto } from './producto.entity';

@ObjectType()
export class TablaAforo {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  altura: number; // Altura en centímetros

  @Field(() => Float)
  volumen: number; // Volumen en litros

  @Field()
  tanqueId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Tanque {
  @Field(() => ID)
  id: string;

  @Field()
  numero: string;

  @Field(() => Float)
  capacidadTotal: number;

  @Field(() => Float)
  nivelActual: number;

  @Field(() => Float)
  nivelMinimo: number;

  @Field(() => Float, { nullable: true })
  diametro?: number; // En metros

  @Field(() => Float, { nullable: true })
  alturaMaxima?: number; // En metros

  @Field({ nullable: true })
  tipoTanque?: string;

  @Field()
  activo: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  productoId: string;

  @Field()
  puntoVentaId: string;

  @Field(() => Producto, { nullable: true })
  producto?: Producto;

  @Field(() => [TablaAforo], { nullable: true })
  tablaAforo?: TablaAforo[];

  // Campos calculados
  @Field(() => Float)
  nivelPorcentaje?: number;

  @Field(() => Float, { nullable: true })
  volumenActualPorAltura?: number; // Volumen calculado basado en la altura actual
}

@ObjectType()
export class TanqueWithStatus {
  @Field(() => Tanque)
  tanque: Tanque;

  @Field()
  estado: string; // 'NORMAL', 'BAJO', 'CRITICO', 'VACIO'

  @Field(() => Float)
  porcentajeLlenado: number;

  @Field()
  requiereAbastecimiento: boolean;
} 