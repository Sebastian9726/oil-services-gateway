import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PointOfSale } from '../../point-of-sale/entities/point-of-sale.entity';

@ObjectType()
export class Company {
  @Field(() => ID)
  id: string;

  @Field()
  rut: string;

  @Field()
  razonSocial: string;

  @Field({ nullable: true })
  nombreComercial?: string;

  @Field()
  nombre: string;

  @Field()
  direccion: string;

  @Field()
  ciudad: string;

  @Field({ nullable: true })
  provincia?: string;

  @Field()
  pais: string;

  @Field({ nullable: true })
  codigoPostal?: string;

  @Field({ nullable: true })
  telefono?: string;

  @Field({ nullable: true })
  telefonoMovil?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  sitioWeb?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  sector?: string;

  @Field({ nullable: true })
  tipoEmpresa?: string;

  @Field({ nullable: true })
  fechaConstitucion?: Date;

  @Field()
  activo: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relaciones
  @Field(() => [PointOfSale])
  puntosVenta: PointOfSale[];
} 