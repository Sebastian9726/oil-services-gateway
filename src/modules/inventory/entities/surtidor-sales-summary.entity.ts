import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductoInfo {
  @Field()
  codigo: string;

  @Field()
  nombre: string;
}

@ObjectType()
export class VentasTotales {
  @Field(() => Float)
  totalGalones: number;

  @Field(() => Float)
  totalLitros: number;

  @Field(() => Float)
  totalValor: number;

  @Field(() => Int)
  numeroTransacciones: number;
}

@ObjectType()
export class UltimaVenta {
  @Field()
  fecha: Date;

  @Field(() => Float)
  galones: number;

  @Field(() => Float)
  litros: number;

  @Field(() => Float)
  valor: number;
}

@ObjectType()
export class MangueraSalesInfo {
  @Field()
  numeroManguera: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => ProductoInfo)
  producto: ProductoInfo;

  @Field(() => VentasTotales)
  ventas: VentasTotales;

  @Field(() => UltimaVenta, { nullable: true })
  ultimaVenta?: UltimaVenta;
}

@ObjectType()
export class SurtidorInfo {
  @Field()
  numero: string;

  @Field()
  nombre: string;

  @Field({ nullable: true })
  ubicacion?: string;
}

@ObjectType()
export class PeriodoInfo {
  @Field({ nullable: true })
  desde?: Date;

  @Field({ nullable: true })
  hasta?: Date;
}

@ObjectType()
export class TotalesSurtidor {
  @Field(() => Float)
  totalGalones: number;

  @Field(() => Float)
  totalLitros: number;

  @Field(() => Float)
  totalValor: number;
}

@ObjectType()
export class SurtidorSalesSummary {
  @Field(() => SurtidorInfo)
  surtidor: SurtidorInfo;

  @Field(() => PeriodoInfo)
  periodo: PeriodoInfo;

  @Field(() => [MangueraSalesInfo])
  mangueras: MangueraSalesInfo[];

  @Field(() => TotalesSurtidor)
  totalesSurtidor: TotalesSurtidor;
} 