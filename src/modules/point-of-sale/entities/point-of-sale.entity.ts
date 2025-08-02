import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Company } from '../../company/entities/company.entity';

@ObjectType()
export class PointOfSale {
  @Field(() => ID)
  id: string;

  @Field()
  codigo: string;

  @Field()
  nombre: string;

  @Field({ nullable: true })
  descripcion?: string;

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
  horarioApertura?: string;

  @Field({ nullable: true })
  horarioCierre?: string;

  @Field(() => [String])
  diasAtencion: string[];

  @Field({ nullable: true })
  coordenadasGPS?: string;

  @Field({ nullable: true })
  tipoEstacion?: string;

  @Field(() => [String])
  serviciosAdicionales: string[];

  @Field(() => Int, { nullable: true })
  capacidadMaxima?: number;

  @Field({ nullable: true })
  fechaApertura?: Date;

  @Field()
  activo: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  empresaId: string;

  // Relaciones
  @Field(() => Company)
  empresa: Company;
} 