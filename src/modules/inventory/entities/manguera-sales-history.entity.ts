import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class MangueraIdentifier {
  @Field()
  numeroSurtidor: string;

  @Field()
  numeroManguera: string;
}

@ObjectType()
export class VentaDetalle {
  @Field()
  fecha: Date;

  @Field(() => Float)
  lecturaAnterior: number;

  @Field(() => Float)
  lecturaActual: number;

  @Field(() => Float)
  galonesVendidos: number;

  @Field(() => Float)
  litrosVendidos: number;

  @Field(() => Float)
  valorVenta: number;

  @Field()
  tipoOperacion: string;

  @Field({ nullable: true })
  observaciones?: string;
}

@ObjectType()
export class TotalesVentas {
  @Field(() => Float)
  totalGalones: number;

  @Field(() => Float)
  totalLitros: number;

  @Field(() => Float)
  totalValor: number;

  @Field(() => Int)
  numeroVentas: number;
}

@ObjectType()
export class PaginacionInfo {
  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class PeriodoConsulta {
  @Field({ nullable: true })
  desde?: Date;

  @Field({ nullable: true })
  hasta?: Date;
}

@ObjectType()
export class MangueraSalesHistory {
  @Field(() => MangueraIdentifier)
  manguera: MangueraIdentifier;

  @Field(() => PeriodoConsulta)
  periodo: PeriodoConsulta;

  @Field(() => [VentaDetalle])
  ventas: VentaDetalle[];

  @Field(() => TotalesVentas)
  totales: TotalesVentas;

  @Field(() => PaginacionInfo)
  paginacion: PaginacionInfo;
} 