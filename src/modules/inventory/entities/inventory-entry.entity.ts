import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class TankHeightEntryResult {
  @Field()
  tanqueId: string;

  @Field()
  nombreTanque: string;

  @Field(() => Float)
  alturaFluidoAnterior: number;

  @Field(() => Float)
  alturaFluidoNueva: number;

  @Field(() => Float)
  diferenciaAltura: number;

  @Field(() => Float)
  volumenCalculadoLitros: number;

  @Field(() => Float)
  volumenCalculadoGalones: number;

  @Field()
  procesadoExitosamente: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  observaciones?: string;
}

@ObjectType()
export class ProductEntryResult {
  @Field()
  codigoProducto: string;

  @Field()
  nombreProducto: string;

  @Field()
  unidadMedida: string;

  @Field(() => Float)
  cantidadIngresada: number;

  @Field(() => Float)
  stockAnterior: number;

  @Field(() => Float)
  stockNuevo: number;

  @Field(() => Float)
  precioCompra: number;

  @Field(() => Float)
  costoTotal: number;

  @Field()
  procesadoExitosamente: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  lote?: string;

  @Field({ nullable: true })
  fechaVencimiento?: string;

  @Field({ nullable: true })
  proveedor?: string;

  @Field({ nullable: true })
  numeroFactura?: string;

  @Field({ nullable: true })
  observaciones?: string;
}

@ObjectType()
export class CarrotanqueEntryResult {
  @Field()
  carrotanqueId: string;

  @Field()
  placa: string;

  @Field()
  codigoProducto: string;

  @Field()
  nombreProducto: string;

  @Field(() => Float)
  cantidadDescargada: number;

  @Field()
  unidadMedida: string;

  @Field(() => Float)
  precioCompra: number;

  @Field(() => Float)
  costoTotal: number;

  @Field(() => Float)
  nivelAnterior: number;

  @Field(() => Float)
  nivelNuevo: number;

  @Field()
  procesadoExitosamente: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  numeroRemision?: string;

  @Field({ nullable: true })
  observaciones?: string;
}

@ObjectType()
export class ResumenFinancieroIngreso {
  @Field(() => Float)
  costoTotalTanques: number;

  @Field(() => Float)
  costoTotalProductos: number;

  @Field(() => Float)
  costoTotalCarrotanques: number;

  @Field(() => Float)
  costoTotalGeneral: number;

  @Field(() => Int)
  cantidadTanquesActualizados: number;

  @Field(() => Int)
  cantidadProductosIngresados: number;

  @Field(() => Int)
  cantidadCarrotanquesDescargados: number;

  @Field({ nullable: true })
  observaciones?: string;
}

@ObjectType()
export class ResumenInventarioIngreso {
  @Field(() => Float)
  volumenTotalIngresadoLitros: number;

  @Field(() => Float)
  volumenTotalIngresadoGalones: number;

  @Field(() => Int)
  productosNocombustiblesIngresados: number;

  @Field(() => Float)
  valorInventarioIncrementado: number;

  @Field({ nullable: true })
  observaciones?: string;
}

@ObjectType()
export class InventoryEntryResponse {
  @Field(() => [TankHeightEntryResult], { nullable: true })
  resumenTanques?: TankHeightEntryResult[];

  @Field(() => [ProductEntryResult], { nullable: true })
  resumenProductos?: ProductEntryResult[];

  @Field(() => [CarrotanqueEntryResult], { nullable: true })
  resumenCarrotanques?: CarrotanqueEntryResult[];

  @Field(() => ResumenFinancieroIngreso)
  resumenFinanciero: ResumenFinancieroIngreso;

  @Field(() => ResumenInventarioIngreso)
  resumenInventario: ResumenInventarioIngreso;

  @Field()
  fechaProceso: Date;

  @Field()
  entradaId: string;

  @Field()
  responsable: string;

  @Field()
  estado: string;

  @Field(() => [String], { nullable: true })
  errores?: string[];

  @Field(() => [String], { nullable: true })
  advertencias?: string[];

  @Field({ nullable: true })
  observacionesGenerales?: string;
}
