import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Producto } from './producto.entity';

@ObjectType()
export class ProductoRentabilidad {
  @Field(() => ID)
  id: string;

  @Field()
  codigo: string;

  @Field()
  nombre: string;

  @Field(() => Float)
  precioCompra: number;

  @Field(() => Float)
  precioVenta: number;

  @Field()
  moneda: string;

  @Field(() => Float)
  utilidad: number; // precioVenta - precioCompra

  @Field(() => Float)
  margenUtilidad: number; // ((precioVenta - precioCompra) / precioVenta) * 100

  @Field(() => Float)
  porcentajeGanancia: number; // ((precioVenta - precioCompra) / precioCompra) * 100

  @Field(() => Float)
  ventasEstimadas: number; // Ventas proyectadas (se puede calcular según histórico)

  @Field(() => Float)
  utilidadProyectada: number; // utilidad * ventasEstimadas

  @Field()
  clasificacionRentabilidad: string; // 'ALTA', 'MEDIA', 'BAJA'

  @Field()
  recomendacion: string; // Texto con recomendación de precio
}

@ObjectType()
export class ResumenRentabilidad {
  @Field(() => [ProductoRentabilidad])
  productos: ProductoRentabilidad[];

  @Field(() => Float)
  utilidadTotalProyectada: number;

  @Field(() => Float)
  margenPromedioGeneral: number;

  @Field()
  productoMasRentable: string;

  @Field()
  productoMenosRentable: string;

  @Field()
  totalProductos: number;
} 