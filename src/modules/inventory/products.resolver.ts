import { Resolver, Query, Mutation, Args, ID, Int, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { ProductsService } from './products.service';
import { SurtidoresService } from './surtidores.service';
import { Producto, ProductListResponse } from './entities/producto.entity';
import { 
  ProductWithConversionsResponse, 
  StockConversion, 
  Equivalencias,
  InventorySummaryResponse,
  TotalesInventario
} from './entities/conversion-response.entity';
import {
  ActualizacionInventarioResponse
} from './entities/dispenser-readings.entity';
import {
  CierreTurno,
  CierreTurnoListResponse
} from './entities/shift-closure.entity';
import {
  CierreTurnoInput,
  LecturaMangueraInput
} from './dto/shift-closure.input';
import { SimpleStockUpdateInput } from './dto/simple-stock-update.input';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { PrismaService } from '../../config/prisma/prisma.service';

@Resolver(() => Producto)
@UseGuards(JwtAuthGuard)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly surtidoresService: SurtidoresService,
    private readonly prisma: PrismaService,
  ) {}

  @Mutation(() => Producto)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async createProduct(@Args('createProductInput') createProductInput: CreateProductInput): Promise<Producto> {
    return this.productsService.create(createProductInput);
  }

  @Query(() => ProductListResponse, { name: 'products' })
  async findAllProducts(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number = 1,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number = 10,
    @Args('searchTerm', { nullable: true }) searchTerm?: string,
    @Args('categoriaId', { type: () => ID, nullable: true }) categoriaId?: string,
    @Args('activo', { nullable: true }) activo?: boolean,
    @Args('esCombustible', { nullable: true }) esCombustible?: boolean,
  ): Promise<ProductListResponse> {
    return this.productsService.findAll({
      page,
      limit,
      searchTerm,
      categoriaId,
      activo,
      esCombustible,
    });
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
  @Roles('admin', 'manager', 'employee')
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
      precioVenta: Number(product.precioVenta),
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
      precioLitro: Number(product.precioVenta),
      precioGalon: Math.round(Number(product.precioVenta) / LITERS_TO_GALLONS * 100) / 100
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
      precioLitro: Number(product.precioVenta),
      precioGalon: Math.round(Number(product.precioVenta) / LITERS_TO_GALLONS * 100) / 100,
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
  @Roles('admin', 'manager')
  async updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ): Promise<Producto> {
    return this.productsService.update(id, updateProductInput);
  }

  @Mutation(() => Producto)
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
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
  @Roles('admin', 'manager')
  async toggleProductStatus(@Args('id', { type: () => ID }) id: string): Promise<Producto> {
    return this.productsService.toggleProductStatus(id);
  }

  @Query(() => String, { name: 'productStats' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async getProductStats(): Promise<string> {
    const stats = await this.productsService.getProductStats();
    return JSON.stringify(stats);
  }

  @Query(() => InventorySummaryResponse, { name: 'inventorySummaryWithConversions' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
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
      precioLitro: Number(product.precioVenta),
      precioGalon: Math.round(Number(product.precioVenta) / LITERS_TO_GALLONS * 100) / 100
    }));

    // Calcular totales
    const totalLitros = products.reduce((sum, product) => sum + product.stockActual, 0);
    const totalGalones = Math.round(totalLitros * LITERS_TO_GALLONS * 100) / 100;
    
    const valorTotalLitros = products.reduce((sum, product) => 
      sum + (product.stockActual * Number(product.precioVenta)), 0
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
  @Roles('admin', 'manager', 'employee')
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

  @Mutation(() => ActualizacionInventarioResponse, { name: 'processShiftClosure' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async processShiftClosure(
    @Args('cierreTurnoInput') cierreTurnoInput: CierreTurnoInput,
    @CurrentUser() user: any
  ): Promise<ActualizacionInventarioResponse> {
    const GALONES_TO_LITROS = 3.78541;
    const LITROS_TO_GALONES = 0.264172;
    
    const errores: string[] = [];
    const advertencias: string[] = [];
    const resumenSurtidores = [];
    let productosActualizados = 0;
    let tanquesActualizados = 0;
    let totalGeneralLitros = 0;
    let totalGeneralGalones = 0;
    let valorTotalGeneral = 0;

    try {
      for (const surtidor of cierreTurnoInput.lecturasSurtidores) {
        console.log(`[CIERRE_TURNO] Validando surtidor: ${surtidor.numeroSurtidor} para punto de venta: ${cierreTurnoInput.puntoVentaId}`);
        
        const surtidorExists = await this.surtidoresService.validateSurtidorExists(surtidor.numeroSurtidor, cierreTurnoInput.puntoVentaId);
        if (!surtidorExists) {
          errores.push(`Surtidor ${surtidor.numeroSurtidor} no encontrado o no pertenece al punto de venta ${cierreTurnoInput.puntoVentaId}`);
          continue;
        }

        // Validar cada manguera del surtidor con el punto de venta específico
        for (const manguera of surtidor.mangueras) {
          const mangueraExists = await this.surtidoresService.validateMangueraExists(
            surtidor.numeroSurtidor,
            manguera.numeroManguera,
            manguera.codigoProducto
          );
          if (!mangueraExists) {
            errores.push(`Manguera ${manguera.numeroManguera} no válida para surtidor ${surtidor.numeroSurtidor} en punto de venta ${cierreTurnoInput.puntoVentaId}`);
          }
        }
      }

      // Si hay errores de validación, retornar inmediatamente
      if (errores.length > 0) {
        const resumenFinancieroVacio = this.crearResumenFinancieroVacio();
        return {
          resumenSurtidores: [],
          totalGeneralLitros: 0,
          totalGeneralGalones: 0,
          valorTotalGeneral: 0,
          resumenFinanciero: resumenFinancieroVacio,
          fechaProceso: new Date(),
          turnoId: cierreTurnoInput.puntoVentaId,
          productosActualizados: 0,
          estado: 'fallido',
          errores: errores
        };
      }

      console.log(`[CIERRE_TURNO] Validación exitosa. Procesando ${cierreTurnoInput.lecturasSurtidores.length} surtidores`);

      // 3. PROCESAR CADA SURTIDOR (ya validado que pertenece al punto de venta)
      for (const surtidor of cierreTurnoInput.lecturasSurtidores) {
        const ventasCalculadas = [];
        let totalSurtidorLitros = 0;
        let totalSurtidorGalones = 0;
        let valorTotalSurtidor = 0;

        console.log(`[CIERRE_TURNO] Procesando surtidor: ${surtidor.numeroSurtidor} con ${surtidor.mangueras.length} mangueras`);

        // Procesar cada manguera del surtidor
        for (const manguera of surtidor.mangueras) {
          try {
            // Buscar producto
            const product = await this.productsService.findByCode(manguera.codigoProducto);
            if (!product) {
              errores.push(`Producto no encontrado: ${manguera.codigoProducto} en surtidor ${surtidor.numeroSurtidor}`);
              continue;
            }

            console.log(`[CIERRE_TURNO] Producto encontrado: ${product.codigo} - Stock actual: ${product.stockActual}L`);

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

            console.log(`[CIERRE_TURNO] Cantidad a descontar: ${cantidadLitros}L (${cantidadVendida} ${manguera.unidadMedida})`);
            
            // Calcular precios
            const precioLitro = Number(product.precioVenta);
            const precioGalon = Math.round(precioLitro / LITROS_TO_GALONES * 100) / 100;
            const valorVenta = cantidadLitros * precioLitro;

            // ACTUALIZAR LECTURAS DE LA MANGUERA SIEMPRE
            console.log(`[CIERRE_TURNO] Actualizando lecturas: surtidor=${surtidor.numeroSurtidor}, manguera=${manguera.numeroManguera}`);
            
            try {
              const lecturaActualizada = await this.surtidoresService.updateMangueraReadingsWithHistory(
                surtidor.numeroSurtidor,
                manguera.numeroManguera,
                manguera.lecturaActual,
                precioLitro,
                'cierre_turno',
                user.id,
                cierreTurnoInput.startTime,
                cierreTurnoInput.finishTime,
                `Cierre de turno ${cierreTurnoInput.puntoVentaId} - Cantidad vendida: ${cantidadLitros}L`
              );
              
              if (!lecturaActualizada.success) {
                advertencias.push(`No se pudo actualizar lecturas para surtidor ${surtidor.numeroSurtidor}, manguera ${manguera.numeroManguera}`);
              } else {
                console.log(`[CIERRE_TURNO] Lecturas actualizadas - Cantidad vendida: ${lecturaActualizada.cantidadVendida}L`);
              }
            } catch (lecturaError) {
              console.error(`[CIERRE_TURNO] Error actualizando lecturas:`, lecturaError);
              advertencias.push(`Error actualizando lecturas en surtidor ${surtidor.numeroSurtidor}, manguera ${manguera.numeroManguera}: ${lecturaError.message}`);
            }

            // VERIFICAR STOCK Y ACTUALIZAR INVENTARIO
            let stockActualizado = false;
            if (cantidadLitros > product.stockActual) {
              errores.push(`Stock insuficiente para ${manguera.codigoProducto} en surtidor ${surtidor.numeroSurtidor}: necesario ${cantidadLitros}L, disponible ${product.stockActual}L`);
            } else {
              try {
                await this.productsService.updateStock(product.id, cantidadLitros, 'salida');
                productosActualizados++;
                stockActualizado = true;
                console.log(`[CIERRE_TURNO] Stock actualizado para ${product.codigo}: -${cantidadLitros}L`);
              } catch (stockError) {
                errores.push(`Error actualizando stock de ${manguera.codigoProducto}: ${stockError.message}`);
              }
            }

            // ACTUALIZAR TANQUE DEL PUNTO DE VENTA ESPECÍFICO
            if (stockActualizado && product.esCombustible) {
              try {
                // Buscar tanque específico del punto de venta para este producto
                const tanqueActualizado = await this.productsService.updateTankLevelForPointOfSale(
                  product.id, 
                  cierreTurnoInput.puntoVentaId, 
                  cantidadLitros, 
                  'salida'
                );
                if (tanqueActualizado) {
                  tanquesActualizados++;
                  console.log(`[CIERRE_TURNO] Tanque actualizado para producto ${product.codigo} en punto de venta ${cierreTurnoInput.puntoVentaId}`);
                }
              } catch (tankError) {
                advertencias.push(`No se pudo actualizar tanque para producto ${manguera.codigoProducto} en punto de venta ${cierreTurnoInput.puntoVentaId}: ${tankError.message}`);
              }
            }

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

      console.log(`[CIERRE_TURNO] Procesamiento completado:`, {
        puntoVenta: cierreTurnoInput.puntoVentaId,
        totalLitros: totalGeneralLitros,
        totalGalones: totalGeneralGalones,
        valorTotal: valorTotalGeneral,
        productosActualizados,
        tanquesActualizados,
        estado
      });

      // VALIDAR Y PROCESAR MÉTODOS DE PAGO
      const resumenFinanciero = this.procesarMetodosPagoTurno(
        cierreTurnoInput.resumenVentas,
        valorTotalGeneral,
        errores,
        advertencias
      );

      // GUARDAR EN BASE DE DATOS - OPERACIÓN TRANSACCIONAL
      const cierreTurnoGuardado = await this.prisma.$transaction(async (prisma) => {
        // Crear o encontrar un turno para este punto de venta
        let turno = await prisma.turno.findFirst({
          where: {
            puntoVentaId: cierreTurnoInput.puntoVentaId,
            activo: true
          },
          orderBy: { fechaInicio: 'desc' }
        });

        // Si no existe un turno, crear uno temporal
        if (!turno) {
          turno = await prisma.turno.create({
            data: {
              fechaInicio: new Date(cierreTurnoInput.startTime),
              fechaFin: new Date(cierreTurnoInput.finishTime),
              horaInicio: new Date(cierreTurnoInput.startTime).toLocaleTimeString(),
              horaFin: new Date(cierreTurnoInput.finishTime).toLocaleTimeString(),
              observaciones: `Turno automático para cierre de ${cierreTurnoInput.puntoVentaId}`,
              activo: true,
              puntoVentaId: cierreTurnoInput.puntoVentaId,
              usuarioId: user.id
            }
          });
        }

        // Crear el cierre de turno con la información financiera en el resumen
        const resumenCompleto = {
          surtidores: resumenSurtidores,
          financiero: resumenFinanciero
        };

        const cierre = await prisma.cierreTurno.create({
          data: {
            turnoId: turno.id, // Usar el turno real
            usuarioId: user.id,
            fechaCierre: new Date(),
            totalVentasLitros: totalGeneralLitros,
            totalVentasGalones: totalGeneralGalones,
            valorTotalGeneral: valorTotalGeneral,
            productosActualizados,
            tanquesActualizados,
            estado,
            errores: errores.length > 0 ? errores : [],
            advertencias: advertencias.length > 0 ? advertencias : [],
            resumenSurtidores: resumenCompleto,
            observacionesGenerales: cierreTurnoInput.observacionesGenerales || 
              `Total declarado: $${resumenFinanciero.totalDeclarado}, Diferencia: $${resumenFinanciero.diferencia}`
          }
        });

        return cierre;
      });

      console.log(`[CIERRE_TURNO] Datos guardados en BD con ID: ${cierreTurnoGuardado.id}`);

      return {
        resumenSurtidores,
        totalGeneralLitros: Math.round(totalGeneralLitros * 100) / 100,
        totalGeneralGalones: Math.round(totalGeneralGalones * 100) / 100,
        valorTotalGeneral: Math.round(valorTotalGeneral * 100) / 100,
        resumenFinanciero,
        fechaProceso: new Date(),
        turnoId: cierreTurnoGuardado.id, // Retornamos el ID del cierre creado
        productosActualizados,
        estado,
        errores: errores.length > 0 ? errores : undefined,
        advertencias: advertencias.length > 0 ? [...advertencias, `Punto de venta: ${cierreTurnoInput.puntoVentaId}`, `Tanques actualizados: ${tanquesActualizados}`, `Cierre guardado: ${cierreTurnoGuardado.id}`] : [`Punto de venta: ${cierreTurnoInput.puntoVentaId}`, `Tanques actualizados: ${tanquesActualizados}`, `Cierre guardado: ${cierreTurnoGuardado.id}`]
      };

    } catch (error) {
      console.error('[CIERRE_TURNO] Error general:', error);
      const resumenFinancieroVacio = this.crearResumenFinancieroVacio();
      return {
        resumenSurtidores: [],
        totalGeneralLitros: 0,
        totalGeneralGalones: 0,
        valorTotalGeneral: 0,
        resumenFinanciero: resumenFinancieroVacio,
        fechaProceso: new Date(),
        turnoId: cierreTurnoInput.puntoVentaId,
        productosActualizados: 0,
        estado: 'fallido',
        errores: [`Error general: ${error.message}`]
      };
    }
  }

  @Query(() => CierreTurnoListResponse, { name: 'getShiftClosures' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getShiftClosures(
    @Args('turnoId', { type: () => ID, nullable: true }) turnoId?: string,
    @Args('fechaDesde', { nullable: true }) fechaDesde?: Date,
    @Args('fechaHasta', { nullable: true }) fechaHasta?: Date,
    @Args('estado', { nullable: true }) estado?: string,
    @Args('usuarioId', { type: () => ID, nullable: true }) usuarioId?: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number = 1,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number = 10
  ): Promise<CierreTurnoListResponse> {
    return this.productsService.getShiftClosures({
      turnoId,
      fechaDesde,
      fechaHasta,
      estado,
      usuarioId,
      page,
      limit
    });
  }

  @Query(() => CierreTurno, { name: 'getShiftClosure' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getShiftClosure(@Args('id', { type: () => ID }) id: string): Promise<CierreTurno> {
    return this.productsService.getShiftClosureById(id);
  }

  @Query(() => [CierreTurno], { name: 'getShiftClosuresByDate' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getShiftClosuresByDate(
    @Args('fecha') fecha: Date
  ): Promise<CierreTurno[]> {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const result = await this.productsService.getShiftClosures({
      fechaDesde: fechaInicio,
      fechaHasta: fechaFin,
      limit: 100 // Para obtener todos los cierres del día
    });

    return result.cierres;
  }

  @Mutation(() => Producto, { name: 'updateStockSimple' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async updateStockSimple(
    @Args('input') input: SimpleStockUpdateInput
  ): Promise<Producto> {
    const GALONES_TO_LITROS = 3.78541; // 1 galón = 3.78541 litros
    
    // Buscar producto
    const product = await this.productsService.findByCode(input.codigoProducto);
    if (!product) {
      throw new Error(`Producto no encontrado: ${input.codigoProducto}`);
    }

    // Convertir cantidad a litros si viene en galones
    let cantidadEnLitros = input.cantidad;
    if (input.unidadMedida.toLowerCase() === 'galones') {
      cantidadEnLitros = input.cantidad * GALONES_TO_LITROS;
    } else if (input.unidadMedida.toLowerCase() !== 'litros') {
      throw new Error(`Unidad no soportada: ${input.unidadMedida}. Use 'litros' o 'galones'`);
    }

    // Actualizar stock
    const updatedProduct = await this.productsService.updateStock(
      product.id, 
      Math.round(cantidadEnLitros * 100) / 100, 
      input.tipo as 'entrada' | 'salida'
    );

    return updatedProduct;
  }

  @Query(() => String, { name: 'tankStatus' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getTankStatus(): Promise<string> {
    const tanks = await this.productsService.getTankStatus();
    return JSON.stringify(tanks);
  }

  @Query(() => String, { name: 'debugProductStock' })
  @UseGuards(RolesGuard) 
  @Roles('admin', 'manager', 'employee')
  async debugProductStock(@Args('codigo') codigo: string): Promise<string> {
    const product = await this.productsService.findByCode(codigo);
    if (!product) {
      return JSON.stringify({ error: `Producto ${codigo} no encontrado` });
    }
    
    return JSON.stringify({
      codigo: product.codigo,
      nombre: product.nombre,
      stockActual: product.stockActual,
      stockMinimo: product.stockMinimo,
      unidadMedida: product.unidadMedida,
      precioVenta: Number(product.precioVenta),
      esCombustible: product.esCombustible,
      activo: product.activo
    });
  }

  @Query(() => String, { name: 'getCierreFinanciero' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getCierreFinanciero(@Args('cierreId', { type: () => ID }) cierreId: string): Promise<string> {
    const cierre = await this.prisma.cierreTurno.findUnique({
      where: { id: cierreId },
      include: {
        usuario: true,
        turno: {
          include: {
            puntoVenta: true
          }
        }
      }
    });

    if (!cierre) {
      throw new Error('Cierre de turno no encontrado');
    }

    // Extraer información financiera del JSON
    const resumenCompleto = cierre.resumenSurtidores as any;
    const resumenFinanciero = resumenCompleto?.financiero || {
      totalDeclarado: 0,
      totalCalculado: Number(cierre.valorTotalGeneral),
      diferencia: 0 - Number(cierre.valorTotalGeneral),
      metodosPago: [],
      totalEfectivo: 0,
      totalTarjetas: 0,
      totalTransferencias: 0,
      totalOtros: 0
    };

    const cierreDetallado = {
      id: cierre.id,
      fechaCierre: cierre.fechaCierre,
      usuario: {
        nombre: cierre.usuario.nombre,
        apellido: cierre.usuario.apellido,
        email: cierre.usuario.email
      },
      puntoVenta: cierre.turno?.puntoVenta?.nombre || 'No identificado',
      
      // RESUMEN FÍSICO
      ventasFisicas: {
        totalLitros: Number(cierre.totalVentasLitros),
        totalGalones: Number(cierre.totalVentasGalones),
        valorCalculado: Number(cierre.valorTotalGeneral)
      },

      // RESUMEN FINANCIERO
      ventasFinancieras: {
        totalDeclarado: resumenFinanciero.totalDeclarado,
        totalCalculado: resumenFinanciero.totalCalculado,
        diferencia: resumenFinanciero.diferencia,
        metodosPago: resumenFinanciero.metodosPago,
        desglosePorTipo: {
          efectivo: resumenFinanciero.totalEfectivo,
          tarjetas: resumenFinanciero.totalTarjetas,
          transferencias: resumenFinanciero.totalTransferencias,
          otros: resumenFinanciero.totalOtros
        }
      },

      // ESTADÍSTICAS
      estadisticas: {
        productosActualizados: cierre.productosActualizados,
        tanquesActualizados: cierre.tanquesActualizados,
        estado: cierre.estado,
        tieneErrores: cierre.errores.length > 0,
        tieneAdvertencias: cierre.advertencias.length > 0
      },

      errores: cierre.errores,
      advertencias: cierre.advertencias,
      observaciones: cierre.observacionesGenerales
    };

    return JSON.stringify(cierreDetallado, null, 2);
  }

  @Query(() => String, { name: 'getCierresFinancierosHoy' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getCierresFinancierosHoy(): Promise<string> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const cierres = await this.prisma.cierreTurno.findMany({
      where: {
        fechaCierre: {
          gte: hoy,
          lt: manana
        }
      },
      include: {
        usuario: true,
        turno: {
          include: {
            puntoVenta: true
          }
        }
      },
      orderBy: { fechaCierre: 'desc' }
    });

    const resumenDiario = {
      fecha: hoy,
      totalCierres: cierres.length,
      resumenGeneral: {
        totalVentasLitros: 0,
        totalVentasGalones: 0,
        valorTotalCalculado: 0,
        totalDeclarado: 0,
        diferenciaAcumulada: 0,
        totalEfectivo: 0,
        totalTarjetas: 0,
        totalTransferencias: 0,
        totalOtros: 0
      },
      cierres: cierres.map(cierre => {
        const resumenCompleto = cierre.resumenSurtidores as any;
        const resumenFinanciero = resumenCompleto?.financiero || {};

        // Acumular totales
        resumenDiario.resumenGeneral.totalVentasLitros += Number(cierre.totalVentasLitros);
        resumenDiario.resumenGeneral.totalVentasGalones += Number(cierre.totalVentasGalones);
        resumenDiario.resumenGeneral.valorTotalCalculado += Number(cierre.valorTotalGeneral);
        resumenDiario.resumenGeneral.totalDeclarado += resumenFinanciero.totalDeclarado || 0;
        resumenDiario.resumenGeneral.diferenciaAcumulada += resumenFinanciero.diferencia || 0;
        resumenDiario.resumenGeneral.totalEfectivo += resumenFinanciero.totalEfectivo || 0;
        resumenDiario.resumenGeneral.totalTarjetas += resumenFinanciero.totalTarjetas || 0;
        resumenDiario.resumenGeneral.totalTransferencias += resumenFinanciero.totalTransferencias || 0;
        resumenDiario.resumenGeneral.totalOtros += resumenFinanciero.totalOtros || 0;

        return {
          id: cierre.id,
          fechaCierre: cierre.fechaCierre,
          usuario: `${cierre.usuario.nombre} ${cierre.usuario.apellido}`,
          puntoVenta: cierre.turno?.puntoVenta?.nombre || 'No identificado',
          valorCalculado: Number(cierre.valorTotalGeneral),
          totalDeclarado: resumenFinanciero.totalDeclarado || 0,
          diferencia: resumenFinanciero.diferencia || 0,
          estado: cierre.estado,
          cantidadMetodosPago: resumenFinanciero.metodosPago?.length || 0
        };
      })
    };

    return JSON.stringify(resumenDiario, null, 2);
  }

  private crearResumenFinancieroVacio(): any {
    return {
      totalDeclarado: 0,
      totalCalculado: 0,
      diferencia: 0,
      metodosPago: [],
      totalEfectivo: 0,
      totalTarjetas: 0,
      totalTransferencias: 0,
      totalOtros: 0,
      observaciones: 'No se procesaron métodos de pago'
    };
  }

  private procesarMetodosPagoTurno(
    resumenVentas: any,
    valorTotalGeneral: number,
    errores: string[],
    advertencias: string[]
  ): any {
    if (!resumenVentas || !resumenVentas.metodosPago || !Array.isArray(resumenVentas.metodosPago)) {
      errores.push('Información de métodos de pago no válida');
      return this.crearResumenFinancieroVacio();
    }

    const totalDeclarado = resumenVentas.totalVentasTurno || 0;
    const totalCalculado = valorTotalGeneral;
    const diferencia = totalDeclarado - totalCalculado;

    // Validar que la suma de métodos de pago coincida con el total declarado
    const sumaPagos = resumenVentas.metodosPago.reduce((sum: number, pago: any) => sum + pago.monto, 0);
    if (Math.abs(sumaPagos - totalDeclarado) > 0.01) {
      errores.push(`La suma de métodos de pago ($${sumaPagos}) no coincide con el total declarado ($${totalDeclarado})`);
    }

    // Calcular totales por método de pago
    let totalEfectivo = 0;
    let totalTarjetas = 0;
    let totalTransferencias = 0;
    let totalOtros = 0;

    const metodosPagoResumen = resumenVentas.metodosPago.map((pago: any) => {
      const monto = pago.monto || 0;
      const porcentaje = totalDeclarado > 0 ? (monto / totalDeclarado) * 100 : 0;

      // Clasificar por tipo de método de pago
      switch (pago.metodoPago) {
        case 'EFECTIVO':
          totalEfectivo += monto;
          break;
        case 'TARJETA_CREDITO':
        case 'TARJETA_DEBITO':
          totalTarjetas += monto;
          break;
        case 'TRANSFERENCIA':
          totalTransferencias += monto;
          break;
        default:
          totalOtros += monto;
      }

      return {
        metodoPago: pago.metodoPago,
        monto: Math.round(monto * 100) / 100,
        porcentaje: Math.round(porcentaje * 100) / 100,
        observaciones: pago.observaciones
      };
    });

    return {
      totalDeclarado: Math.round(totalDeclarado * 100) / 100,
      totalCalculado: Math.round(totalCalculado * 100) / 100,
      diferencia: Math.round(diferencia * 100) / 100,
      metodosPago: metodosPagoResumen,
      totalEfectivo: Math.round(totalEfectivo * 100) / 100,
      totalTarjetas: Math.round(totalTarjetas * 100) / 100,
      totalTransferencias: Math.round(totalTransferencias * 100) / 100,
      totalOtros: Math.round(totalOtros * 100) / 100,
      observaciones: resumenVentas.observaciones
    };
  }
} 