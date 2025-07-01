import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { MangueraSurtidor } from './manguera-surtidor.entity';

@ObjectType()
export class HistorialLectura {
  @Field(() => ID)
  id: string;

  @Field()
  fechaLectura: Date;

  @Field(() => Float)
  lecturaAnterior: number;

  @Field(() => Float)
  lecturaActual: number;

  @Field(() => Float)
  cantidadVendida: number;

  @Field(() => Float)
  valorVenta: number;

  @Field()
  tipoOperacion: string; // "cierre_turno", "ajuste_manual", "calibracion"

  @Field({ nullable: true })
  observaciones?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relaciones
  @Field(() => ID)
  mangueraId: string;

  @Field(() => MangueraSurtidor)
  manguera: MangueraSurtidor;

  @Field(() => ID, { nullable: true })
  usuarioId?: string;

  @Field(() => ID, { nullable: true })
  turnoId?: string;

  @Field(() => ID, { nullable: true })
  cierreTurnoId?: string;
}

@ObjectType()
export class HistorialLecturaListResponse {
  @Field(() => [HistorialLectura])
  historial: HistorialLectura[];

  @Field()
  total: number;

  @Field()
  totalPages: number;

  @Field()
  currentPage: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
} 