import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { VentaCalculada, ResumenSurtidor } from './surtidor-readings.entity';

@ObjectType()
export class ShiftClosure {
  @Field(() => ID)
  id: string;

  @Field()
  fechaCierre: Date;

  @Field(() => Float)
  totalVentasLitros: number;

  @Field(() => Float)
  totalVentasGalones: number;

  @Field(() => Float)
  valorTotalGeneral: number;

  @Field(() => Int)
  productosActualizados: number;

  @Field(() => Int)
  tanquesActualizados: number;

  @Field()
  estado: string;

  @Field(() => [String], { nullable: true })
  errores?: string[];

  @Field(() => [String], { nullable: true })
  advertencias?: string[];

  @Field(() => [ResumenSurtidor])
  resumenSurtidores: ResumenSurtidor[];

  @Field({ nullable: true })
  observacionesGenerales?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ID)
  turnoId: string;

  @Field(() => ID)
  usuarioId: string;
}

@ObjectType()
export class ShiftClosureListResponse {
  @Field(() => [ShiftClosure])
  cierres: ShiftClosure[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}

// Keep Spanish versions for backward compatibility
export { ShiftClosure as CierreTurno, ShiftClosureListResponse as CierreTurnoListResponse }; 