import { ObjectType, Field, ID, Float, Int, InputType } from '@nestjs/graphql';

@InputType()
export class HoseReadingInput {
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
export class DispenserReadingInput {
  @Field()
  numeroSurtidor: string;

  @Field(() => [HoseReadingInput])
  mangueras: HoseReadingInput[];

  @Field({ nullable: true })
  observaciones?: string;
}

@InputType()
export class ShiftClosureInput {
  @Field()
  turnoId: string;

  @Field(() => [DispenserReadingInput])
  lecturasSurtidores: DispenserReadingInput[];

  @Field({ nullable: true })
  observacionesGenerales?: string;
}

@ObjectType()
export class CalculatedSale {
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
export class DispenserSummary {
  @Field()
  numeroSurtidor: string;

  @Field(() => [CalculatedSale])
  ventas: CalculatedSale[];

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
export class InventoryUpdateResponse {
  @Field(() => [DispenserSummary])
  resumenSurtidores: DispenserSummary[];

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

// Keep Spanish versions for backward compatibility
export { HoseReadingInput as LecturaMangueraInput };
export { DispenserReadingInput as LecturaSurtidorInput };
export { ShiftClosureInput as CierreTurnoInput };
export { CalculatedSale as VentaCalculada };
export { DispenserSummary as ResumenSurtidor };
export { InventoryUpdateResponse as ActualizacionInventarioResponse }; 