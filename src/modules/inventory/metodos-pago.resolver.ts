import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MetodoPago, MetodoPagoListResponse, MetodoPagoEnum } from './entities/metodo-pago.entity';

@Resolver(() => MetodoPago)
@UseGuards(JwtAuthGuard)
export class MetodosPagoResolver {

  @Query(() => MetodoPagoListResponse, { name: 'metodosPagoDisponibles' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getMetodosPagoDisponibles(): Promise<MetodoPagoListResponse> {
    const metodosPago: MetodoPago[] = [
      {
        codigo: MetodoPagoEnum.EFECTIVO,
        nombre: 'Efectivo',
        descripcion: 'Pago en dinero en efectivo',
        activo: true,
        icono: '💵',
        categoria: 'efectivo'
      },
      {
        codigo: MetodoPagoEnum.TARJETA_CREDITO,
        nombre: 'Tarjeta de Crédito',
        descripcion: 'Pago con tarjeta de crédito',
        activo: true,
        icono: '💳',
        categoria: 'tarjeta'
      },
      {
        codigo: MetodoPagoEnum.TARJETA_DEBITO,
        nombre: 'Tarjeta de Débito',
        descripcion: 'Pago con tarjeta de débito',
        activo: true,
        icono: '💳',
        categoria: 'tarjeta'
      },
      {
        codigo: MetodoPagoEnum.TRANSFERENCIA,
        nombre: 'Transferencia Bancaria',
        descripcion: 'Transferencia electrónica de fondos',
        activo: true,
        icono: '🏦',
        categoria: 'digital'
      },
      {
        codigo: MetodoPagoEnum.QR,
        nombre: 'Código QR',
        descripcion: 'Pago mediante código QR',
        activo: true,
        icono: '📱',
        categoria: 'digital'
      },
      {
        codigo: MetodoPagoEnum.CHEQUE,
        nombre: 'Cheque',
        descripcion: 'Pago con cheque bancario',
        activo: true,
        icono: '📄',
        categoria: 'cheque'
      },
      {
        codigo: MetodoPagoEnum.CREDITO,
        nombre: 'Crédito',
        descripcion: 'Venta a crédito (pago diferido)',
        activo: true,
        icono: '📋',
        categoria: 'credito'
      },
      {
        codigo: MetodoPagoEnum.CREDITO,
        nombre: 'Crédito',
        descripcion: 'Venta a crédito (pago diferido)',
        activo: true,
        icono: '📋',
        categoria: 'credito'
      },
      {
        codigo: MetodoPagoEnum.RUMBO,
        nombre: 'Rumbo',
        descripcion: 'Pago con Rumbo',
        activo: true,
        icono: '📱',
        categoria: 'digital'
      },
      {
        codigo: MetodoPagoEnum.PUNTOS,
        nombre: 'Puntos',
        descripcion: 'Puntos de crédito',
        activo: true,
        icono: '📱',
        categoria: 'digital'
      }
    ];

    return {
      metodosPago,
      total: metodosPago.length
    };
  }

  @Query(() => [String], { name: 'metodosPagoCodigos' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getMetodosPagoCodigos(): Promise<string[]> {
    return Object.values(MetodoPagoEnum);
  }
} 