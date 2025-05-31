import { Resolver, Query, Mutation, Args, ID, Int, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { ProductsService } from './products.service';
import { Producto } from './entities/producto.entity';
import { 
  ProductWithConversionsResponse, 
  StockConversion, 
  Equivalencias,
  InventorySummaryResponse,
  TotalesInventario
} from './entities/conversion-response.entity';
import {
  CierreTurnoInput,
  ActualizacionInventarioResponse,
  LecturaMangueraInput
} from './entities/surtidor-readings.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Resolver(() => Producto)
@UseGuards(JwtAuthGuard)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => Producto)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async createProduct(@Args('createProductInput') createProductInput: CreateProductInput): Promise<Producto> {
    return this.productsService.create(createProductInput);
  }

  @Query(() => [Producto], { name: 'products' })
  async findAllProducts(): Promise<Producto[]> {
    return this.productsService.findAll();
  }

  @Query(() => Producto, { name: 'product' })
  async findOneProduct(@Args('id', { type: () => ID }) id: string): Promise<Producto> {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  @Query(() => Producto, { name: 'productByCode' })
  async findProductByCode(@Args('codigo') codigo: string): Promise<Producto> {
    const product = await this.productsService.findByCode(codigo);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  @Query(() => [Producto], { name: 'productsByCategory' })
  async findProductsByCategory(@Args('categoriaId', { type: () => ID }) categoriaId: string): Promise<Producto[]> {
    return this.productsService.findByCategory(categoriaId);
  }

  @Query(() => [Producto], { name: 'activeProducts' })
  async findActiveProducts(): Promise<Producto[]> {
    return this.productsService.findActive();
  }

  @Query(() => [Producto], { name: 'lowStockProducts' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente', 'empleado')
  async findLowStockProducts(): Promise<Producto[]> {
    return this.productsService.findLowStock();
  }

  @Query(() => [Producto], { name: 'fuelProducts' })
  async findFuelProducts(): Promise<Producto[]> {
    return this.productsService.findFuel();
  }

  @Query(() => [ProductWithConversionsResponse], { name: 'fuelProductsWithConversions' })
  async findFuelProductsWithConversions(): Promise<ProductWithConversionsResponse[]> {
    const products = await this.productsService.findFuel();
    
    const LITERS_TO_GALLONS = 0.264172; // 1 litro = 0.264172 galones
    
    return products.map(product => ({
      ...product,
      stockEnLitros: {
        cantidad: product.stockActual,
        unidad: 'litros',
        formatted: `${product.stockActual} litros`
      } as StockConversion,
      stockEnGalones: {
        cantidad: Math.round(product.stockActual * LITERS_TO_GALLONS * 100) / 100,
        unidad: 'galones',
        formatted: `${Math.round(product.stockActual * LITERS_TO_GALLONS * 100) / 100} galones`
      } as StockConversion,
      precioLitro: product.precio,
      precioGalon: Math.round(product.precio / LITERS_TO_GALLONS * 100) / 100
    }));
  }

  @Query(() => ProductWithConversionsResponse, { name: 'productWithConversions' })
  async findProductWithConversions(@Args('codigo') codigo: string): Promise<ProductWithConversionsResponse> {
    const product = await this.productsService.findByCode(codigo);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    
    const LITERS_TO_GALLONS = 0.264172;
    
    return {
      ...product,
      stockEnLitros: {
        cantidad: product.stockActual,
        unidad: 'litros',
        formatted: `${product.stockActual} litros`
      } as StockConversion,
      stockEnGalones: {
        cantidad: Math.round(product.stockActual * LITERS_TO_GALLONS * 100) / 100,
        unidad: 'galones',
        formatted: `${Math.round(product.stockActual * LITERS_TO_GALLONS * 100) / 100} galones`
      } as StockConversion,
      precioLitro: product.precio,
      precioGalon: Math.round(product.precio / LITERS_TO_GALLONS * 100) / 100,
      equivalencias: {
        litro_a_galones: "0.264172 galones",
        galon_a_litros: "3.78541 litros"
      } as Equivalencias
    };
  }

  @Query(() => [Producto], { name: 'searchProducts' })
  async searchProducts(@Args('searchTerm') searchTerm: string): Promise<Producto[]> {
    return this.productsService.searchProducts(searchTerm);
  }

  @Mutation(() => Producto)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ): Promise<Producto> {
    return this.productsService.update(id, updateProductInput);
  }

  @Mutation(() => Producto)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async updateProductStock(
    @Args('id', { type: () => ID }) id: string,
    @Args('cantidad', { type: () => Int }) cantidad: number,
    @Args('tipo') tipo: 'entrada' | 'salida',
  ): Promise<Producto> {
    return this.productsService.updateStock(id, cantidad, tipo);
  }

  @Mutation(() => Producto)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removeProduct(@Args('id', { type: () => ID }) id: string): Promise<Producto> {
    return this.productsService.remove(id);
  }

  @Mutation(() => Producto)
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async toggleProductStatus(@Args('id', { type: () => ID }) id: string): Promise<Producto> {
    return this.productsService.toggleProductStatus(id);
  }

  @Query(() => String, { name: 'productStats' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente')
  async getProductStats(): Promise<string> {
    const stats = await this.productsService.getProductStats();
    return JSON.stringify(stats);
  }

  @Query(() => InventorySummaryResponse, { name: 'inventorySummaryWithConversions' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente', 'empleado')
  async getInventorySummaryWithConversions(): Promise<InventorySummaryResponse> {
    const products = await this.productsService.findFuel();
    
    const LITERS_TO_GALLONS = 0.264172;
    
    const productosConConversiones = products.map(product => ({
      ...product,
      stockEnLitros: {
        cantidad: product.stockActual,
        unidad: 'litros',
        formatted: `${product.stockActual} litros`
      } as StockConversion,
      stockEnGalones: {
        cantidad: Math.round(product.stockActual * LITERS_TO_GALLONS * 100) / 100,
        unidad: 'galones',
        formatted: `${Math.round(product.stockActual * LITERS_TO_GALLONS * 100) / 100} galones`
      } as StockConversion,
      precioLitro: product.precio,
      precioGalon: Math.round(product.precio / LITERS_TO_GALLONS * 100) / 100
    }));

    // Calcular totales
    const totalLitros = products.reduce((sum, product) => sum + product.stockActual, 0);
    const totalGalones = Math.round(totalLitros * LITERS_TO_GALLONS * 100) / 100;
    
    const valorTotalLitros = products.reduce((sum, product) => 
      sum + (product.stockActual * product.precio), 0
    );
    const valorTotalGalones = Math.round(valorTotalLitros / LITERS_TO_GALLONS * 100) / 100;

    return {
      productos: productosConConversiones,
      totales: {
        totalLitros,
        totalGalones,
        valorTotalLitros: Math.round(valorTotalLitros * 100) / 100,
        valorTotalGalones: Math.round(valorTotalGalones * 100) / 100
      } as TotalesInventario,
      fechaConsulta: new Date(),
      totalProductos: products.length
    };
  }

  @Mutation(() => Producto, { name: 'updateStockWithConversion' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente', 'empleado')
  async updateStockWithConversion(
    @Args('codigoProducto') codigoProducto: string,
    @Args('cantidad', { type: () => Float }) cantidad: number,
    @Args('unidadEntrada') unidadEntrada: string,
    @Args('tipo') tipo: 'entrada' | 'salida',
    @Args('observaciones', { nullable: true }) observaciones?: string
  ): Promise<Producto> {
    const GALONES_TO_LITROS = 3.78541; // 1 galón = 3.78541 litros
    
    // Buscar producto
    const product = await this.productsService.findByCode(codigoProducto);
    if (!product) {
      throw new Error(`Producto no encontrado: ${codigoProducto}`);
    }

    // Convertir cantidad a litros si viene en galones
    let cantidadEnLitros = cantidad;
    if (unidadEntrada.toLowerCase() === 'galones') {
      cantidadEnLitros = cantidad * GALONES_TO_LITROS;
    } else if (unidadEntrada.toLowerCase() !== 'litros') {
      throw new Error(`Unidad no soportada: ${unidadEntrada}. Use 'litros' o 'galones'`);
    }

    // Actualizar stock
    return this.productsService.updateStock(product.id, Math.round(cantidadEnLitros * 100) / 100, tipo);
  }

  @Mutation(() => ActualizacionInventarioResponse, { name: 'procesarCierreTurno' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'gerente', 'empleado')
  async procesarCierreTurno(
    @Args('cierreTurnoInput') cierreTurnoInput: CierreTurnoInput
  ): Promise<ActualizacionInventarioResponse> {
    const GALONES_TO_LITROS = 3.78541;
    const LITROS_TO_GALONES = 0.264172;
    
    const errores: string[] = [];
    const advertencias: string[] = [];
    const resumenSurtidores = [];
    let productosActualizados = 0;
    let totalGeneralLitros = 0;
    let totalGeneralGalones = 0;
    let valorTotalGeneral = 0;

    try {
      // Procesar cada surtidor
      for (const surtidor of cierreTurnoInput.lecturasSurtidores) {
        const ventasCalculadas = [];
        let totalSurtidorLitros = 0;
        let totalSurtidorGalones = 0;
        let valorTotalSurtidor = 0;

        // Procesar cada manguera del surtidor
        for (const manguera of surtidor.mangueras) {
          try {
            // Buscar producto
            const product = await this.productsService.findByCode(manguera.codigoProducto);
            if (!product) {
              errores.push(`Producto no encontrado: ${manguera.codigoProducto} en surtidor ${surtidor.numeroSurtidor}`);
              continue;
            }

            // Calcular cantidad vendida
            const cantidadVendida = manguera.lecturaActual - manguera.lecturaAnterior;
            if (cantidadVendida < 0) {
              errores.push(`Lectura inválida en surtidor ${surtidor.numeroSurtidor}, manguera ${manguera.numeroManguera}: lectura actual menor que anterior`);
              continue;
            }

            if (cantidadVendida === 0) {
              advertencias.push(`Sin ventas en surtidor ${surtidor.numeroSurtidor}, manguera ${manguera.numeroManguera}`);
              continue;
            }

            // Convertir a ambas unidades
            let cantidadLitros = cantidadVendida;
            let cantidadGalones = cantidadVendida;

            if (manguera.unidadMedida.toLowerCase() === 'galones') {
              cantidadLitros = cantidadVendida * GALONES_TO_LITROS;
            } else if (manguera.unidadMedida.toLowerCase() === 'litros') {
              cantidadGalones = cantidadVendida * LITROS_TO_GALONES;
            } else {
              errores.push(`Unidad no válida: ${manguera.unidadMedida} en surtidor ${surtidor.numeroSurtidor}`);
              continue;
            }

            // Redondear
            cantidadLitros = Math.round(cantidadLitros * 100) / 100;
            cantidadGalones = Math.round(cantidadGalones * 100) / 100;

            // Calcular precios
            const precioLitro = product.precio;
            const precioGalon = Math.round(precioLitro / LITROS_TO_GALONES * 100) / 100;
            const valorVenta = cantidadLitros * precioLitro;

            // Actualizar stock (restar del inventario)
            await this.productsService.updateStock(product.id, cantidadLitros, 'salida');
            productosActualizados++;

            // Agregar a resumen
            ventasCalculadas.push({
              codigoProducto: manguera.codigoProducto,
              nombreProducto: product.nombre,
              cantidadVendidaGalones: cantidadGalones,
              cantidadVendidaLitros: cantidadLitros,
              precioUnitarioLitro: precioLitro,
              precioUnitarioGalon: precioGalon,
              valorTotalVenta: Math.round(valorVenta * 100) / 100,
              unidadOriginal: manguera.unidadMedida
            });

            totalSurtidorLitros += cantidadLitros;
            totalSurtidorGalones += cantidadGalones;
            valorTotalSurtidor += valorVenta;

          } catch (error) {
            errores.push(`Error procesando manguera ${manguera.numeroManguera} del surtidor ${surtidor.numeroSurtidor}: ${error.message}`);
          }
        }

        resumenSurtidores.push({
          numeroSurtidor: surtidor.numeroSurtidor,
          ventas: ventasCalculadas,
          totalVentasLitros: Math.round(totalSurtidorLitros * 100) / 100,
          totalVentasGalones: Math.round(totalSurtidorGalones * 100) / 100,
          valorTotalSurtidor: Math.round(valorTotalSurtidor * 100) / 100,
          observaciones: surtidor.observaciones
        });

        totalGeneralLitros += totalSurtidorLitros;
        totalGeneralGalones += totalSurtidorGalones;
        valorTotalGeneral += valorTotalSurtidor;
      }

      const estado = errores.length > 0 ? 'con_errores' : 'exitoso';

      return {
        resumenSurtidores,
        totalGeneralLitros: Math.round(totalGeneralLitros * 100) / 100,
        totalGeneralGalones: Math.round(totalGeneralGalones * 100) / 100,
        valorTotalGeneral: Math.round(valorTotalGeneral * 100) / 100,
        fechaProceso: new Date(),
        turnoId: cierreTurnoInput.turnoId,
        productosActualizados,
        estado,
        errores: errores.length > 0 ? errores : undefined,
        advertencias: advertencias.length > 0 ? advertencias : undefined
      };

    } catch (error) {
      return {
        resumenSurtidores: [],
        totalGeneralLitros: 0,
        totalGeneralGalones: 0,
        valorTotalGeneral: 0,
        fechaProceso: new Date(),
        turnoId: cierreTurnoInput.turnoId,
        productosActualizados: 0,
        estado: 'fallido',
        errores: [`Error general: ${error.message}`]
      };
    }
  }
} 