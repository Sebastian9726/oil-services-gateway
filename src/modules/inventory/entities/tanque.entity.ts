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
  nombre: string;

  @Field(() => Float)
  capacidadTotal: number;

  @Field(() => Float)
  nivelActual: number;

  @Field(() => Float)
  nivelMinimo: number;

  @Field(() => Float)
  alturaActual: number; // Altura actual del fluido en centímetros

  @Field(() => Float, { nullable: true })
  diametro?: number; // En metros

  @Field(() => Float, { nullable: true })
  alturaMaxima?: number; // En metros

  @Field({ nullable: true })
  tipoTanque?: string;

  @Field()
  unidadMedida: string;

  @Field(() => Boolean)
  activo: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  productoId: string;

  @Field()
  puntoVentaId: string;

  // Campos calculados
  @Field(() => Float, { nullable: true })
  nivelPorcentaje?: number;

  @Field(() => Float, { nullable: true })
  volumenActualPorAltura?: number;

  // Relaciones
  @Field(() => Producto)
  producto: Producto;

  @Field(() => [TablaAforo], { nullable: true })
  tablaAforo?: TablaAforo[];
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

@ObjectType()
export class TanqueUpdateResponse {
  @Field(() => Tanque)
  tanque: Tanque;

  @Field(() => Boolean)
  success: boolean;

  @Field(() => [String])
  warnings: string[];

  @Field(() => [String])
  messages: string[];

  @Field({ nullable: true })
  status?: string; // 'NORMAL', 'WARNING', 'CRITICAL'
} 