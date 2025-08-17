import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

export enum MetodoPagoEnum {
  EFECTIVO = 'EFECTIVO',
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  TARJETA_DEBITO = 'TARJETA_DEBITO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  QR = 'QR',
  CHEQUE = 'CHEQUE',
  CREDITO = 'CREDITO',
  REGALO = 'REGALO',
  RUMBO = 'RUMBO',
  PUNTOS = 'PUNTOS'
}

// Registrar el enum para GraphQL
registerEnumType(MetodoPagoEnum, {
  name: 'MetodoPagoEnum',
  description: 'Métodos de pago disponibles en el sistema',
});

@ObjectType()
export class MetodoPago {
  @Field()
  codigo: string;

  @Field()
  nombre: string;

  @Field()
  descripcion: string;

  @Field()
  activo: boolean;

  @Field()
  icono: string;

  @Field()
  categoria: string; // efectivo, tarjeta, digital, credito
}

@ObjectType()
export class MetodoPagoListResponse {
  @Field(() => [MetodoPago])
  metodosPago: MetodoPago[];

  @Field()
  total: number;
} 