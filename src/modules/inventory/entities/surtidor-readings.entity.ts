import { ObjectType, Field, ID, Float, Int, InputType } from '@nestjs/graphql';

@InputType()
export class LecturaMangueraInput {
  @Field()
  numeroManguera: string;

  @Field()
  codigoProducto: string; // GASOL-95, DIESEL, etc.

  @Field(() => Float)
  lecturaAnterior: number;

  @Field(() => Float)
  lecturaActual: number;

  @Field()
  unidadMedida: string; // "galones" o "litros"

  @Field({ nullable: true })
  observaciones?: string;
}

@InputType()
export class LecturaSurtidorInput {
  @Field()
  numeroSurtidor: string;

  @Field(() => [LecturaMangueraInput])
  mangueras: LecturaMangueraInput[];

  @Field({ nullable: true })
  observaciones?: string;
}

@InputType()
export class CierreTurnoInput {
  @Field()
  turnoId: string;

  @Field(() => [LecturaSurtidorInput])
  lecturasSurtidores: LecturaSurtidorInput[];

  @Field({ nullable: true })
  observacionesGenerales?: string;
}

@ObjectType()
export class VentaCalculada {
  @Field()
  codigoProducto: string;

  @Field()
  nombreProducto: string;

  @Field(() => Float)
  cantidadVendidaGalones: number;

  @Field(() => Float)
  cantidadVendidaLitros: number;

  @Field(() => Float)
  precioUnitarioLitro: number;

  @Field(() => Float)
  precioUnitarioGalon: number;

  @Field(() => Float)
  valorTotalVenta: number;

  @Field()
  unidadOriginal: string;
}

@ObjectType()
export class ResumenSurtidor {
  @Field()
  numeroSurtidor: string;

  @Field(() => [VentaCalculada])
  ventas: VentaCalculada[];

  @Field(() => Float)
  totalVentasLitros: number;

  @Field(() => Float)
  totalVentasGalones: number;

  @Field(() => Float)
  valorTotalSurtidor: number;

  @Field({ nullable: true })
  observaciones?: string;
}

@ObjectType()
export class ActualizacionInventarioResponse {
  @Field(() => [ResumenSurtidor])
  resumenSurtidores: ResumenSurtidor[];

  @Field(() => Float)
  totalGeneralLitros: number;

  @Field(() => Float)
  totalGeneralGalones: number;

  @Field(() => Float)
  valorTotalGeneral: number;

  @Field()
  fechaProceso: Date;

  @Field()
  turnoId: string;

  @Field(() => Int)
  productosActualizados: number;

  @Field()
  estado: string; // "exitoso", "con_errores", "fallido"

  @Field(() => [String], { nullable: true })
  errores?: string[];

  @Field(() => [String], { nullable: true })
  advertencias?: string[];
} 