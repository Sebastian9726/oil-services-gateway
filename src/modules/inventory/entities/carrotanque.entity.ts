import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime/library';

@ObjectType()
export class Carrotanque {
  @Field(() => ID)
  id: string;

  @Field()
  nombre: string;

  @Field()
  placa: string;

  @Field(() => Float)
  capacidadTotal: number | Decimal;

  @Field(() => Float)
  nivelActual: number | Decimal;

  @Field(() => Float)
  nivelMinimo: number | Decimal;

  @Field(() => Float)
  alturaActual: number | Decimal;

  @Field(() => Float, { nullable: true })
  diametro?: number | Decimal;

  @Field(() => Float, { nullable: true })
  alturaMaxima?: number | Decimal;

  @Field({ nullable: true })
  tipoCarrotanque?: string;

  @Field()
  unidadMedida: string;

  @Field()
  activo: boolean;

  @Field({ nullable: true })
  conductor?: string;

  @Field({ nullable: true })
  empresa?: string;

  @Field({ nullable: true })
  observaciones?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [TablaAforoCarrotanque], { nullable: true })
  tablaAforo?: TablaAforoCarrotanque[];
}

@ObjectType()
export class TablaAforoCarrotanque {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  altura: number | Decimal;

  @Field(() => Float)
  volumen: number | Decimal;

  @Field()
  carrotanqueId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Carrotanque, { nullable: true })
  carrotanque?: Carrotanque;
}

@ObjectType()
export class CarrotanqueListResponse {
  @Field(() => [Carrotanque])
  carrotanques: Carrotanque[];

  @Field()
  total: number;

  @Field()
  totalPages: number;

  @Field()
  currentPage: number;
}

@ObjectType()
export class CompartimientoSummaryItem {
  @Field(() => ID)
  id: string;

  @Field()
  numero: string;

  @Field()
  nombre: string;

  @Field(() => Float)
  capacidadTotal: number;

  @Field(() => Float)
  nivelActual: number;

  @Field(() => Float)
  porcentajeOcupacion: number;

  @Field({ nullable: true })
  productoId?: string;
}

@ObjectType()
export class CarrotanqueSummaryItem {
  @Field(() => ID)
  id: string;

  @Field()
  nombre: string;

  @Field()
  placa: string;

  @Field(() => Float)
  capacidadTotal: number;

  @Field(() => Float)
  nivelActual: number;

  @Field(() => Float)
  porcentajeOcupacion: number;

  @Field({ nullable: true })
  conductor?: string;

  @Field({ nullable: true })
  empresa?: string;

  @Field(() => [CompartimientoSummaryItem])
  compartimientos: CompartimientoSummaryItem[];
}

@ObjectType()
export class CarrotanquesSummary {
  @Field()
  totalCarrotanques: number;

  @Field()
  totalCompartimientos: number;

  @Field(() => Float)
  capacidadTotalLitros: number;

  @Field(() => Float)
  nivelTotalLitros: number;

  @Field(() => Float)
  porcentajeOcupacionGeneral: number;

  @Field(() => [CarrotanqueSummaryItem])
  carrotanques: CarrotanqueSummaryItem[];
} 