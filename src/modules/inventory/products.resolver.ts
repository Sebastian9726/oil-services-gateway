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
  CierreTurno,
  CierreTurnoListResponse,
  ActualizacionInventarioResponse,
  BusquedaCierresCompletosResponse,
  EstadisticasCierresPorPeriodoResponse
} from './entities/shift-closure.entity';
import {
  CierreTurnoInput,
  LecturaMangueraInput
} from './dto/shift-closure.input';
import { SimpleStockUpdateInput } from './dto/simple-stock-update.input';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { WriteOffExpiredProductsInput } from './dto/write-off-expired.input';
import { WriteOffExpiredProductsResponse } from './entities/write-off-response.entity';
import { PrismaService } from '../../config/prisma/prisma.service';
import { TanquesService } from './tanques.service';

@Resolver(() => Producto)
@UseGuards(JwtAuthGuard)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly surtidoresService: SurtidoresService,
    private readonly prisma: PrismaService,
    private readonly tanquesService: TanquesService
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

    // Variables para estadísticas de ventas
    let ventasCombustiblesCalculadas = 0;
    let ventasProductosCalculadas = 0;

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
          resumenTanques: null,
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

            // Contar venta de combustible
            if (product.esCombustible && cantidadVendida > 0) {
              ventasCombustiblesCalculadas++;
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
                new Date(cierreTurnoInput.startTime),
                new Date(cierreTurnoInput.finishTime),
                `Cierre de turno ${cierreTurnoInput.puntoVentaId} - Cantidad vendida: ${cantidadLitros}L`
              );
              
              if (!lecturaActualizada.success) {
                advertencias.push(`No se pudo actualizar lecturas para surtidor ${surtidor.numeroSurtidor}, manguera ${manguera.numeroManguera}`);
              } else {
                console.log(`[CIERRE_TURNO] Lecturas actualizadas - Cantidad vendida: ${lecturaActualizada.cantidadVendida}G`);
              }
            } catch (lecturaError) {
              console.error(`[CIERRE_TURNO] Error actualizando lecturas:`, lecturaError);
              advertencias.push(`Error actualizando lecturas en surtidor ${surtidor.numeroSurtidor}, manguera ${manguera.numeroManguera}: ${lecturaError.message}`);
            }

            // VERIFICAR STOCK Y ACTUALIZAR INVENTARIO
            let stockActualizado = false;
            
            // Diferenciar manejo según tipo de producto
            if (product.esCombustible) {
              // PARA COMBUSTIBLES: Verificar stock del tanque específico del punto de venta
              try {
                // Buscar tanque específico del punto de venta para este producto
                const tanque = await this.prisma.tanque.findFirst({
                  where: { 
                    productoId: product.id,
                    puntoVentaId: cierreTurnoInput.puntoVentaId,
                    activo: true 
                  }
                });

                if (!tanque) {
                  errores.push(`No se encontró tanque activo para ${product.codigo} en punto de venta ${cierreTurnoInput.puntoVentaId}`);
                } else {
                  const nivelActualTanque = parseFloat(tanque.nivelActual.toString());
                  
                  // Para combustibles, verificar contra el nivel del tanque en litros
                  if (cantidadGalones > nivelActualTanque) {
                    errores.push(`Stock insuficiente en tanque para ${manguera.codigoProducto} en surtidor ${surtidor.numeroSurtidor}: necesario ${cantidadGalones}G, disponible ${nivelActualTanque}G en tanque`);
                  }
                }
              } catch (tankError) {
                errores.push(`Error verificando tanque de ${manguera.codigoProducto}: ${tankError.message}`);
              }
            } else {
              // PARA PRODUCTOS SIN TANQUE (tienda, lubricantes, etc.): Verificar stock del producto en unidades
              const cantidadUnidades = product.unidadMedida.toLowerCase() === 'galones' ? cantidadGalones : cantidadLitros;
              
              if (cantidadUnidades > product.stockActual) {
                errores.push(`Stock insuficiente para ${manguera.codigoProducto} en surtidor ${surtidor.numeroSurtidor}: necesario ${cantidadUnidades} ${product.unidadMedida}, disponible ${product.stockActual} ${product.unidadMedida}`);
              } else {
                try {
                  await this.productsService.updateStock(product.id, cantidadUnidades, 'salida');
                  productosActualizados++;
                  stockActualizado = true;
                  console.log(`[CIERRE_TURNO] Stock actualizado para ${product.codigo}: -${cantidadUnidades} ${product.unidadMedida}`);
                } catch (stockError) {
                  errores.push(`Error actualizando stock de ${manguera.codigoProducto}: ${stockError.message}`);
                }
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

      // PROCESAR LECTURAS DE TANQUES (si se proporcionaron)
      let resumenTanques = null;
      if (cierreTurnoInput.lecturasTanques && cierreTurnoInput.lecturasTanques.length > 0) {
        console.log(`[CIERRE_TURNO] Procesando ${cierreTurnoInput.lecturasTanques.length} lecturas de tanques`);
        console.log(`[CIERRE_TURNO] Lecturas recibidas:`, JSON.stringify(cierreTurnoInput.lecturasTanques, null, 2));
        
        const lecturasTanquesProcesadas = [];
        let volumenTotalTanques = 0;
        let capacidadTotalTanques = 0;

        for (const lecturaTanque of cierreTurnoInput.lecturasTanques) {
          try {
            console.log(`[CIERRE_TURNO] Procesando tanque ${lecturaTanque.nombreTanque} (${lecturaTanque.tanqueId})`);
            
            // Validar que el tanque existe y pertenece al punto de venta
            const tanque = await this.tanquesService.findOne(lecturaTanque.tanqueId);
            console.log(`[CIERRE_TURNO] Tanque encontrado:`, {
              id: tanque.id,
              nombre: tanque.nombre,
              puntoVentaId: tanque.puntoVentaId,
              nivelActual: tanque.nivelActual,
              alturaActual: tanque.alturaActual
            });
            
            if (tanque.puntoVentaId !== cierreTurnoInput.puntoVentaId) {
              errores.push(`Tanque ${lecturaTanque.nombreTanque} no pertenece al punto de venta ${cierreTurnoInput.puntoVentaId}`);
              console.log(`[CIERRE_TURNO] ERROR: Tanque no pertenece al punto de venta. Esperado: ${cierreTurnoInput.puntoVentaId}, Actual: ${tanque.puntoVentaId}`);
              continue;
            }

            // Actualizar la altura del tanque y calcular volumen
            console.log(`[CIERRE_TURNO] Actualizando altura del tanque a ${lecturaTanque.alturaFluido}cm`);
            const updateResult = await this.tanquesService.updateLevelByHeight(
              lecturaTanque.tanqueId, 
              lecturaTanque.alturaFluido
            );

            console.log(`[CIERRE_TURNO] Resultado de actualización:`, {
              success: updateResult.success,
              warnings: updateResult.warnings,
              messages: updateResult.messages,
              status: updateResult.status,
              nivelActual: updateResult.tanque?.nivelActual,
              nivelPorcentaje: updateResult.tanque?.nivelPorcentaje
            });

            if (updateResult.success) {
              tanquesActualizados++;
              
              lecturasTanquesProcesadas.push({
                tanqueId: lecturaTanque.tanqueId,
                nombreTanque: lecturaTanque.nombreTanque,
                alturaFluido: lecturaTanque.alturaFluido,
                volumenCalculado: updateResult.tanque.nivelActual,
                nivelPorcentaje: updateResult.tanque.nivelPorcentaje,
                tipoTanque: lecturaTanque.tipoTanque || 'FIJO',
                nombreProducto: updateResult.tanque.producto?.nombre,
                codigoProducto: updateResult.tanque.producto?.codigo,
                observaciones: lecturaTanque.observaciones,
                fechaLectura: new Date()
              });

              volumenTotalTanques += updateResult.tanque.nivelActual;
              capacidadTotalTanques += updateResult.tanque.capacidadTotal;

              console.log(`[CIERRE_TURNO] Tanque procesado exitosamente. Volumen total acumulado: ${volumenTotalTanques}L`);

              // Agregar warnings si los hay
              if (updateResult.warnings.length > 0) {
                advertencias.push(...updateResult.warnings.map(w => `Tanque ${lecturaTanque.nombreTanque}: ${w}`));
              }
            } else {
              console.log(`[CIERRE_TURNO] ERROR: Fallo al actualizar tanque:`, updateResult.messages);
              errores.push(`Error actualizando tanque ${lecturaTanque.nombreTanque}: ${updateResult.messages.join(', ')}`);
            }

          } catch (error) {
            console.error(`[CIERRE_TURNO] EXCEPCION procesando tanque ${lecturaTanque.nombreTanque}:`, error);
            errores.push(`Error procesando tanque ${lecturaTanque.nombreTanque}: ${error.message}`);
          }
        }

        // Crear resumen de tanques
        if (lecturasTanquesProcesadas.length > 0) {
          const LITROS_TO_GALONES = 0.264172;
          
          resumenTanques = {
            totalTanques: lecturasTanquesProcesadas.length,
            volumenTotalLitros: Math.round(volumenTotalTanques * 100) / 100,
            volumenTotalGalones: Math.round(volumenTotalTanques * LITROS_TO_GALONES * 100) / 100,
            capacidadTotalLitros: Math.round(capacidadTotalTanques * 100) / 100,
            porcentajeOcupacionGeneral: capacidadTotalTanques > 0 ? 
              Math.round((volumenTotalTanques / capacidadTotalTanques) * 100 * 100) / 100 : 0,
            lecturasTanques: lecturasTanquesProcesadas
          };

          console.log(`[CIERRE_TURNO] Resumen tanques creado:`, {
            totalTanques: resumenTanques.totalTanques,
            volumenTotal: resumenTanques.volumenTotalLitros,
            ocupacion: resumenTanques.porcentajeOcupacionGeneral,
            lecturas: resumenTanques.lecturasTanques.length
          });
        } else {
          console.log(`[CIERRE_TURNO] No se procesaron tanques exitosamente. lecturasTanquesProcesadas.length = ${lecturasTanquesProcesadas.length}`);
        }
      } else {
        console.log(`[CIERRE_TURNO] No se proporcionaron lecturas de tanques o el array está vacío`);
      }

      // PROCESAR VENTAS DE PRODUCTOS DE TIENDA (si se proporcionaron)
      let resumenVentasProductos = null;
      if (cierreTurnoInput.ventasProductos && cierreTurnoInput.ventasProductos.length > 0) {
        console.log(`[CIERRE_TURNO] Procesando ${cierreTurnoInput.ventasProductos.length} ventas de productos`);
        
        const ventasDetalle = [];
        let productosVentaExitosos = 0;
        let productosVentaConError = 0;
        let valorTotalVentasProductos = 0;

        for (const ventaProducto of cierreTurnoInput.ventasProductos) {
          try {
            console.log(`[CIERRE_TURNO] Procesando venta de producto: ${ventaProducto.codigoProducto} - Cantidad: ${ventaProducto.cantidad}`);
            
            // Buscar el producto
            const product = await this.productsService.findByCode(ventaProducto.codigoProducto);
            if (!product) {
              errores.push(`Producto no encontrado: ${ventaProducto.codigoProducto}`);
              ventasDetalle.push({
                codigoProducto: ventaProducto.codigoProducto,
                nombreProducto: 'PRODUCTO NO ENCONTRADO',
                cantidadVendida: 0,
                unidadMedida: ventaProducto.unidadMedida,
                precioUnitario: ventaProducto.precioUnitario,
                valorTotalVenta: 0,
                stockAnterior: 0,
                stockActual: 0,
                procesadoExitosamente: false,
                error: 'Producto no encontrado',
                observaciones: ventaProducto.observaciones
              });
              productosVentaConError++;
              continue;
            }

            console.log(`[CIERRE_TURNO] Producto encontrado: ${product.codigo} - Stock actual: ${product.stockActual}`);

            // Verificar stock disponible
            if (product.stockActual < ventaProducto.cantidad) {
              const error = `Stock insuficiente. Disponible: ${product.stockActual}, Solicitado: ${ventaProducto.cantidad}`;
              errores.push(`${ventaProducto.codigoProducto}: ${error}`);
              ventasDetalle.push({
                codigoProducto: ventaProducto.codigoProducto,
                nombreProducto: product.nombre,
                cantidadVendida: 0,
                unidadMedida: ventaProducto.unidadMedida,
                precioUnitario: ventaProducto.precioUnitario,
                valorTotalVenta: 0,
                stockAnterior: product.stockActual,
                stockActual: product.stockActual,
                procesadoExitosamente: false,
                error,
                observaciones: ventaProducto.observaciones
              });
              productosVentaConError++;
              continue;
            }

            // Validar que el valor total coincida
            const valorCalculado = ventaProducto.cantidad * ventaProducto.precioUnitario;
            if (Math.abs(valorCalculado - ventaProducto.valorTotal) > 0.01) {
              advertencias.push(`${ventaProducto.codigoProducto}: Valor total no coincide. Calculado: ${valorCalculado}, Declarado: ${ventaProducto.valorTotal}`);
            }

            // Actualizar stock del producto
            try {
              await this.productsService.updateStock(product.id, ventaProducto.cantidad, 'salida');
              productosActualizados++;
              
              // Contar venta de producto
              ventasProductosCalculadas++;
              
              console.log(`[CIERRE_TURNO] Stock actualizado para ${product.codigo}: -${ventaProducto.cantidad} ${product.unidadMedida}`);

              ventasDetalle.push({
                codigoProducto: ventaProducto.codigoProducto,
                nombreProducto: product.nombre,
                cantidadVendida: ventaProducto.cantidad,
                unidadMedida: ventaProducto.unidadMedida,
                precioUnitario: ventaProducto.precioUnitario,
                valorTotalVenta: ventaProducto.valorTotal,
                stockAnterior: product.stockActual,
                stockActual: product.stockActual - ventaProducto.cantidad,
                procesadoExitosamente: true,
                error: null,
                observaciones: ventaProducto.observaciones
              });

              productosVentaExitosos++;
              valorTotalVentasProductos += ventaProducto.valorTotal;

              // Agregar al valor total general
              valorTotalGeneral += ventaProducto.valorTotal;

              // Advertencia si el stock queda muy bajo
              const stockFinal = product.stockActual - ventaProducto.cantidad;
              if (stockFinal <= product.stockMinimo && stockFinal > 0) {
                advertencias.push(`${ventaProducto.codigoProducto}: Stock bajo después de la venta (${stockFinal} <= ${product.stockMinimo})`);
              } else if (stockFinal === 0) {
                advertencias.push(`${ventaProducto.codigoProducto}: Producto agotado después de la venta`);
              }

            } catch (stockError) {
              errores.push(`Error actualizando stock de ${ventaProducto.codigoProducto}: ${stockError.message}`);
              ventasDetalle.push({
                codigoProducto: ventaProducto.codigoProducto,
                nombreProducto: product.nombre,
                cantidadVendida: 0,
                unidadMedida: ventaProducto.unidadMedida,
                precioUnitario: ventaProducto.precioUnitario,
                valorTotalVenta: 0,
                stockAnterior: product.stockActual,
                stockActual: product.stockActual,
                procesadoExitosamente: false,
                error: stockError.message,
                observaciones: ventaProducto.observaciones
              });
              productosVentaConError++;
            }

          } catch (error) {
            console.error(`[CIERRE_TURNO] EXCEPCION procesando venta de producto ${ventaProducto.codigoProducto}:`, error);
            errores.push(`Error procesando venta de ${ventaProducto.codigoProducto}: ${error.message}`);
            ventasDetalle.push({
              codigoProducto: ventaProducto.codigoProducto,
              nombreProducto: 'ERROR',
              cantidadVendida: 0,
              unidadMedida: ventaProducto.unidadMedida,
              precioUnitario: ventaProducto.precioUnitario,
              valorTotalVenta: 0,
              stockAnterior: 0,
              stockActual: 0,
              procesadoExitosamente: false,
              error: error.message,
              observaciones: ventaProducto.observaciones
            });
            productosVentaConError++;
          }
        }

        // Crear resumen de ventas de productos
        resumenVentasProductos = {
          totalProductosVendidos: cierreTurnoInput.ventasProductos.length,
          productosExitosos: productosVentaExitosos,
          productosConError: productosVentaConError,
          valorTotalVentasProductos: Math.round(valorTotalVentasProductos * 100) / 100,
          ventasDetalle
        };

        console.log(`[CIERRE_TURNO] Resumen ventas productos creado:`, {
          totalProductos: resumenVentasProductos.totalProductosVendidos,
          exitosos: resumenVentasProductos.productosExitosos,
          conError: resumenVentasProductos.productosConError,
          valorTotal: resumenVentasProductos.valorTotalVentasProductos
        });
      } else {
        console.log(`[CIERRE_TURNO] No se proporcionaron ventas de productos`);
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

      // CALCULAR ESTADÍSTICAS DE VENTAS
      const cantidadVentasDeclaradas = cierreTurnoInput.cantidadVentasRealizadas || 0;
      const cantidadVentasCalculadas = ventasCombustiblesCalculadas + ventasProductosCalculadas;
      
      const estadisticasVentas = {
        cantidadVentasDeclaradas,
        cantidadVentasCalculadas,
        ventasCombustibles: ventasCombustiblesCalculadas,
        ventasProductos: ventasProductosCalculadas,
        promedioVentaPorTransaccion: cantidadVentasCalculadas > 0 ? 
          Math.round((valorTotalGeneral / cantidadVentasCalculadas) * 100) / 100 : 0,
        observaciones: cantidadVentasDeclaradas !== cantidadVentasCalculadas ? 
          `Diferencia entre ventas declaradas (${cantidadVentasDeclaradas}) y calculadas (${cantidadVentasCalculadas})` : 
          'Las ventas declaradas coinciden con las calculadas'
      };

      // Agregar advertencia si hay diferencia en cantidad de ventas
      if (cantidadVentasDeclaradas > 0 && cantidadVentasDeclaradas !== cantidadVentasCalculadas) {
        advertencias.push(`Diferencia en cantidad de ventas: Declaradas=${cantidadVentasDeclaradas}, Calculadas=${cantidadVentasCalculadas}`);
      }

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

        // CREAR ESTRUCTURA COMPLETA CON TODA LA INFORMACIÓN
        const datosCompletosCierre = {
          // === DATOS DE ENTRADA ORIGINALES ===
          datosEntrada: {
            puntoVentaId: cierreTurnoInput.puntoVentaId,
            startTime: cierreTurnoInput.startTime,
            finishTime: cierreTurnoInput.finishTime,
            observacionesGenerales: cierreTurnoInput.observacionesGenerales,
            cantidadVentasRealizadas: cierreTurnoInput.cantidadVentasRealizadas,
            
            // Lecturas de surtidores ORIGINALES (tal como se enviaron)
            lecturasSurtidores: cierreTurnoInput.lecturasSurtidores.map(surtidor => ({
              numeroSurtidor: surtidor.numeroSurtidor,
              observaciones: surtidor.observaciones,
              mangueras: surtidor.mangueras.map(manguera => ({
                numeroManguera: manguera.numeroManguera,
                codigoProducto: manguera.codigoProducto,
                lecturaAnterior: manguera.lecturaAnterior,
                lecturaActual: manguera.lecturaActual,
                unidadMedida: manguera.unidadMedida,
                observaciones: manguera.observaciones
              }))
            })),
            
            // Lecturas de tanques ORIGINALES (tal como se enviaron)
            lecturasTanques: cierreTurnoInput.lecturasTanques?.map(tanque => ({
              tanqueId: tanque.tanqueId,
              nombreTanque: tanque.nombreTanque,
              alturaFluido: tanque.alturaFluido,
              tipoTanque: tanque.tipoTanque,
              observaciones: tanque.observaciones
            })) || [],
            
            // Ventas de productos ORIGINALES (tal como se enviaron)
            ventasProductos: cierreTurnoInput.ventasProductos?.map(venta => ({
              codigoProducto: venta.codigoProducto,
              cantidad: venta.cantidad,
              unidadMedida: venta.unidadMedida,
              precioUnitario: venta.precioUnitario,
              valorTotal: venta.valorTotal,
              observaciones: venta.observaciones
            })) || [],
            
            // Resumen de ventas ORIGINAL (tal como se envió)
            resumenVentas: {
              totalVentasTurno: cierreTurnoInput.resumenVentas.totalVentasTurno,
              observaciones: cierreTurnoInput.resumenVentas.observaciones,
              metodosPago: cierreTurnoInput.resumenVentas.metodosPago.map(pago => ({
                metodoPago: pago.metodoPago,
                monto: pago.monto,
                observaciones: pago.observaciones
              }))
            }
          },
          
          // === DATOS PROCESADOS Y CALCULADOS ===
          datosProcesados: {
            // Resumen de surtidores PROCESADO
            resumenSurtidores: resumenSurtidores,
            
            // Resumen de tanques PROCESADO (si existe)
            resumenTanques: resumenTanques,
            
            // Resumen de ventas de productos PROCESADO (si existe)
            resumenVentasProductos: resumenVentasProductos,
            
            // Estadísticas de ventas CALCULADAS
            estadisticasVentas: estadisticasVentas,
            
            // Resumen financiero PROCESADO
            resumenFinanciero: resumenFinanciero,
            
            // Totales calculados
            totales: {
              totalGeneralLitros: Math.round(totalGeneralLitros * 100) / 100,
              totalGeneralGalones: Math.round(totalGeneralGalones * 100) / 100,
              valorTotalGeneral: Math.round(valorTotalGeneral * 100) / 100,
              productosActualizados: productosActualizados,
              tanquesActualizados: tanquesActualizados
            }
          },
          
          // === METADATOS DEL PROCESAMIENTO ===
          metadatosProcesamiento: {
            fechaProceso: new Date(),
            usuarioId: user.id,
            usuarioNombre: `${user.nombre} ${user.apellido}`,
            usuarioEmail: user.email,
            estado: estado,
            errores: errores,
            advertencias: advertencias,
            tiempoProcesamiento: new Date().getTime() - new Date(cierreTurnoInput.startTime).getTime(),
            versionProcesador: "1.0.0"
          }
        };

        // Crear el cierre de turno con toda la información completa
        const cierre = await prisma.cierreTurno.create({
          data: {
            turnoId: turno.id,
            usuarioId: user.id,
            fechaCierre: new Date(),
            totalVentasLitros: totalGeneralLitros,
            totalVentasGalones: totalGeneralGalones,
            valorTotalGeneral: valorTotalGeneral,
            
            // Datos financieros principales
            totalDeclarado: resumenFinanciero.totalDeclarado,
            diferencia: resumenFinanciero.diferencia,
            totalEfectivo: resumenFinanciero.totalEfectivo,
            totalTarjetas: resumenFinanciero.totalTarjetas,
            totalTransferencias: resumenFinanciero.totalTransferencias,
            totalOtros: resumenFinanciero.totalOtros,
            observacionesFinancieras: resumenFinanciero.observaciones,
            
            productosActualizados,
            tanquesActualizados,
            estado,
            errores: errores.length > 0 ? errores : [],
            advertencias: advertencias.length > 0 ? advertencias : [],
            
            // *** AQUÍ SE ALMACENA TODA LA INFORMACIÓN COMPLETA ***
            resumenSurtidores: datosCompletosCierre,
            
            observacionesGenerales: cierreTurnoInput.observacionesGenerales || 
              `Cierre procesado - Total declarado: $${resumenFinanciero.totalDeclarado}, Total calculado: $${resumenFinanciero.totalCalculado}, Diferencia: $${resumenFinanciero.diferencia}`
          }
        });

        // Crear registros detallados de métodos de pago
        if (resumenFinanciero.metodosPago && resumenFinanciero.metodosPago.length > 0) {
          await Promise.all(
            resumenFinanciero.metodosPago.map(pago =>
              prisma.cierreTurnoMetodoPago.create({
                data: {
                  cierreTurnoId: cierre.id,
                  metodoPago: pago.metodoPago,
                  monto: pago.monto,
                  porcentaje: pago.porcentaje,
                  observaciones: pago.observaciones
                }
              })
            )
          );
        }

        return cierre;
      });

      console.log(`[CIERRE_TURNO] Datos guardados en BD con ID: ${cierreTurnoGuardado.id}`);

      return {
        resumenSurtidores,
        resumenTanques,
        resumenVentasProductos,
        estadisticasVentas,
        totalGeneralLitros: Math.round(totalGeneralLitros * 100) / 100,
        totalGeneralGalones: Math.round(totalGeneralGalones * 100) / 100,
        valorTotalGeneral: Math.round(valorTotalGeneral * 100) / 100,
        resumenFinanciero,
        fechaProceso: new Date(),
        turnoId: cierreTurnoGuardado.id, // Retornamos el ID del cierre creado
        productosActualizados,
        estado,
        cantidadVentasDeclaradas,
        cantidadVentasCalculadas,
        errores: errores.length > 0 ? errores : undefined,
        advertencias: advertencias.length > 0 ? [...advertencias, `Punto de venta: ${cierreTurnoInput.puntoVentaId}`, `Tanques actualizados: ${tanquesActualizados}`, `Cierre guardado: ${cierreTurnoGuardado.id}`] : [`Punto de venta: ${cierreTurnoInput.puntoVentaId}`, `Tanques actualizados: ${tanquesActualizados}`, `Cierre guardado: ${cierreTurnoGuardado.id}`]
      };

    } catch (error) {
      console.error('[CIERRE_TURNO] Error general:', error);
      const resumenFinancieroVacio = this.crearResumenFinancieroVacio();
      return {
        resumenSurtidores: [],
        resumenTanques: null,
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

  @Mutation(() => WriteOffExpiredProductsResponse, { name: 'writeOffExpiredProducts' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async writeOffExpiredProducts(
    @Args('input') input: WriteOffExpiredProductsInput,
    @CurrentUser() user: any
  ): Promise<WriteOffExpiredProductsResponse> {
    // Agregar información del usuario responsable si no se proporciona
    const inputWithUser = {
      ...input,
      responsable: input.responsable || `${user.nombre} ${user.apellido} (${user.username})`
    };

    return this.productsService.writeOffExpiredProducts(inputWithUser);
  }

  @Query(() => String, { name: 'getCierreCompletoDetallado' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getCierreCompletoDetallado(@Args('cierreId', { type: () => ID }) cierreId: string): Promise<string> {
    const cierre = await this.prisma.cierreTurno.findUnique({
      where: { id: cierreId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            username: true
          }
        },
        turno: {
          include: {
            puntoVenta: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                direccion: true
              }
            }
          }
        },
        metodosPago: true
      }
    });

    if (!cierre) {
      throw new Error('Cierre de turno no encontrado');
    }

    // Extraer toda la información completa del JSON
    const datosCompletos = cierre.resumenSurtidores as any;
    
    const cierreCompletoDetallado = {
      // === INFORMACIÓN BÁSICA DEL CIERRE ===
      informacionBasica: {
        id: cierre.id,
        fechaCierre: cierre.fechaCierre,
        estado: cierre.estado,
        createdAt: cierre.createdAt,
        updatedAt: cierre.updatedAt
      },

      // === INFORMACIÓN DEL TURNO Y PUNTO DE VENTA ===
      contexto: {
        turno: {
          id: cierre.turno.id,
          fechaInicio: cierre.turno.fechaInicio,
          fechaFin: cierre.turno.fechaFin,
          horaInicio: cierre.turno.horaInicio,
          horaFin: cierre.turno.horaFin,
          observaciones: cierre.turno.observaciones,
          activo: cierre.turno.activo
        },
        puntoVenta: cierre.turno.puntoVenta ? {
          id: cierre.turno.puntoVenta.id,
          codigo: cierre.turno.puntoVenta.codigo,
          nombre: cierre.turno.puntoVenta.nombre,
          direccion: cierre.turno.puntoVenta.direccion
        } : null,
        usuario: {
          id: cierre.usuario.id,
          nombre: cierre.usuario.nombre,
          apellido: cierre.usuario.apellido,
          email: cierre.usuario.email,
          username: cierre.usuario.username
        }
      },

      // === DATOS ORIGINALES ENVIADOS EN LA QUERY ===
      datosOriginalesEnviados: datosCompletos?.datosEntrada || {
        mensaje: "Datos originales no disponibles (cierre procesado con versión anterior)"
      },

      // === DATOS PROCESADOS Y CALCULADOS ===
      datosCalculados: datosCompletos?.datosProcesados || {
        mensaje: "Datos procesados no disponibles en formato detallado"
      },

      // === METADATOS DEL PROCESAMIENTO ===
      metadatosProcesamiento: datosCompletos?.metadatosProcesamiento || {
        mensaje: "Metadatos no disponibles (cierre procesado con versión anterior)"
      },

      // === RESUMEN FINANCIERO DESDE CAMPOS DIRECTOS ===
      resumenFinancieroDirecto: {
        totalVentasLitros: Number(cierre.totalVentasLitros),
        totalVentasGalones: Number(cierre.totalVentasGalones),
        valorTotalGeneral: Number(cierre.valorTotalGeneral),
        totalDeclarado: Number(cierre.totalDeclarado),
        diferencia: Number(cierre.diferencia),
        totalEfectivo: Number(cierre.totalEfectivo),
        totalTarjetas: Number(cierre.totalTarjetas),
        totalTransferencias: Number(cierre.totalTransferencias),
        totalOtros: Number(cierre.totalOtros),
        observacionesFinancieras: cierre.observacionesFinancieras,
        metodosPagoDetallados: cierre.metodosPago.map(pago => ({
          id: pago.id,
          metodoPago: pago.metodoPago,
          monto: Number(pago.monto),
          porcentaje: Number(pago.porcentaje),
          observaciones: pago.observaciones,
          createdAt: pago.createdAt
        }))
      },

      // === ESTADÍSTICAS DEL PROCESAMIENTO ===
      estadisticas: {
        productosActualizados: cierre.productosActualizados,
        tanquesActualizados: cierre.tanquesActualizados,
        cantidadErrores: cierre.errores.length,
        cantidadAdvertencias: cierre.advertencias.length,
        errores: cierre.errores,
        advertencias: cierre.advertencias
      },

      // === OBSERVACIONES ===
      observaciones: {
        generales: cierre.observacionesGenerales,
        financieras: cierre.observacionesFinancieras
      },

      // === INSTRUCCIONES PARA RECONSTRUIR LA QUERY ORIGINAL ===
      instruccionesReconstruccion: {
        descripcion: "Para reconstruir la query original, usa los datos en 'datosOriginalesEnviados'",
        ejemplo: datosCompletos?.datosEntrada ? {
          query: "mutation ProcessShiftClosure",
          variables: {
            cierreTurnoInput: datosCompletos.datosEntrada
          }
        } : "Datos originales no disponibles para reconstrucción",
        nota: "Los datos originales incluyen exactamente lo que se envió en la mutation original"
      }
    };

    return JSON.stringify(cierreCompletoDetallado, null, 2);
  }

  @Query(() => BusquedaCierresCompletosResponse, { name: 'buscarCierresCompletosConFiltros' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async buscarCierresCompletosConFiltros(
    @Args('fechaDesde', { nullable: true }) fechaDesde?: Date,
    @Args('fechaHasta', { nullable: true }) fechaHasta?: Date,
    @Args('puntoVentaId', { type: () => ID, nullable: true }) puntoVentaId?: string,
    @Args('usuarioId', { type: () => ID, nullable: true }) usuarioId?: string,
    @Args('estado', { nullable: true }) estado?: string,
    @Args('incluirDatosOriginales', { defaultValue: true }) incluirDatosOriginales: boolean = true,
    @Args('incluirDatosProcesados', { defaultValue: false }) incluirDatosProcesados: boolean = false,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number = 1,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number = 10
  ): Promise<BusquedaCierresCompletosResponse> {
    const skip = (page - 1) * limit;
    
    // Construir filtros
    const whereClause: any = {};
    
    if (fechaDesde || fechaHasta) {
      whereClause.fechaCierre = {};
      if (fechaDesde) whereClause.fechaCierre.gte = fechaDesde;
      if (fechaHasta) whereClause.fechaCierre.lte = fechaHasta;
    }
    
    if (usuarioId) {
      whereClause.usuarioId = usuarioId;
    }
    
    if (estado) {
      whereClause.estado = estado;
    }
    
    if (puntoVentaId) {
      whereClause.turno = {
        puntoVentaId: puntoVentaId
      };
    }

    // Obtener total de registros
    const total = await this.prisma.cierreTurno.count({ where: whereClause });

    // Obtener cierres con toda la información
    const cierres = await this.prisma.cierreTurno.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            username: true
          }
        },
        turno: {
          include: {
            puntoVenta: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                direccion: true
              }
            }
          }
        },
        metodosPago: true
      },
      orderBy: { fechaCierre: 'desc' },
      skip: skip,
      take: limit
    });

    // Calcular distribución de estados como JSON string
    const distribucionEstados = cierres.reduce((acc, c) => {
      acc[c.estado] = (acc[c.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Construir respuesta tipada
    const resultadoBusqueda: BusquedaCierresCompletosResponse = {
      // === METADATOS DE LA BÚSQUEDA ===
      metadatos: {
        totalRegistros: total,
        paginaActual: page,
        registrosPorPagina: limit,
        totalPaginas: Math.ceil(total / limit),
        fechaBusqueda: new Date(),
        filtrosAplicados: {
          fechaDesde,
          fechaHasta,
          puntoVentaId,
          usuarioId,
          estado
        },
        opciones: {
          incluirDatosOriginales,
          incluirDatosProcesados
        }
      },

      // === RESUMEN ESTADÍSTICO ===
      resumenEstadistico: {
        totalValorGeneral: cierres.reduce((sum, c) => sum + Number(c.valorTotalGeneral), 0),
        totalLitros: cierres.reduce((sum, c) => sum + Number(c.totalVentasLitros), 0),
        totalGalones: cierres.reduce((sum, c) => sum + Number(c.totalVentasGalones), 0),
        totalDeclarado: cierres.reduce((sum, c) => sum + Number(c.totalDeclarado), 0),
        totalDiferencias: cierres.reduce((sum, c) => sum + Number(c.diferencia), 0),
        productosActualizadosTotal: cierres.reduce((sum, c) => sum + c.productosActualizados, 0),
        tanquesActualizadosTotal: cierres.reduce((sum, c) => sum + c.tanquesActualizados, 0),
        distribucionEstados: JSON.stringify(distribucionEstados)
      },

      // === CIERRES ENCONTRADOS ===
      cierres: cierres.map(cierre => {
        const datosCompletos = cierre.resumenSurtidores as any;
        
        const cierreInfo: any = {
          // Información básica
          id: cierre.id,
          fechaCierre: cierre.fechaCierre,
          estado: cierre.estado,
          
          // Contexto
          usuario: `${cierre.usuario.nombre} ${cierre.usuario.apellido}`,
          puntoVenta: cierre.turno.puntoVenta?.nombre || 'No identificado',
          puntoVentaId: cierre.turno.puntoVentaId,
          
          // Datos financieros resumidos
          resumenFinanciero: {
            valorTotalGeneral: Number(cierre.valorTotalGeneral),
            totalDeclarado: Number(cierre.totalDeclarado),
            diferencia: Number(cierre.diferencia),
            totalLitros: Number(cierre.totalVentasLitros),
            totalGalones: Number(cierre.totalVentasGalones)
          },
          
          // Estadísticas
          estadisticas: {
            productosActualizados: cierre.productosActualizados,
            tanquesActualizados: cierre.tanquesActualizados,
            cantidadErrores: cierre.errores.length,
            cantidadAdvertencias: cierre.advertencias.length
          },

          // Capacidad de reconstrucción
          puedeReconstruirQuery: Boolean(datosCompletos?.datosEntrada)
        };

        // Incluir datos originales si se solicita
        if (incluirDatosOriginales && datosCompletos?.datosEntrada) {
          cierreInfo.datosOriginalesCompletos = JSON.stringify(datosCompletos.datosEntrada);
        }

        // Incluir datos procesados si se solicita
        if (incluirDatosProcesados && datosCompletos?.datosProcesados) {
          cierreInfo.datosProcesadosCompletos = JSON.stringify(datosCompletos.datosProcesados);
        }

        return cierreInfo;
      })
    };

    return resultadoBusqueda;
  }

  @Query(() => EstadisticasCierresPorPeriodoResponse, { name: 'getEstadisticasCierresPorPeriodo' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  async getEstadisticasCierresPorPeriodo(
    @Args('fechaDesde') fechaDesde: Date,
    @Args('fechaHasta') fechaHasta: Date,
    @Args('agruparPor', { defaultValue: 'dia' }) agruparPor: string = 'dia' // 'dia', 'semana', 'mes'
  ): Promise<EstadisticasCierresPorPeriodoResponse> {
    const cierres = await this.prisma.cierreTurno.findMany({
      where: {
        fechaCierre: {
          gte: fechaDesde,
          lte: fechaHasta
        }
      },
      include: {
        turno: {
          include: {
            puntoVenta: {
              select: { id: true, nombre: true }
            }
          }
        },
        usuario: {
          select: { id: true, nombre: true, apellido: true }
        }
      },
      orderBy: { fechaCierre: 'asc' }
    });

    // Agrupar datos según el criterio
    const datosAgrupados = cierres.reduce((acc, cierre) => {
      let clave: string;
      const fecha = new Date(cierre.fechaCierre);
      
      switch (agruparPor) {
        case 'semana':
          const inicioSemana = new Date(fecha);
          inicioSemana.setDate(fecha.getDate() - fecha.getDay());
          clave = inicioSemana.toISOString().split('T')[0];
          break;
        case 'mes':
          clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // dia
          clave = fecha.toISOString().split('T')[0];
      }

      if (!acc[clave]) {
        acc[clave] = {
          periodo: clave,
          totalCierres: 0,
          valorTotalGeneral: 0,
          totalLitros: 0,
          totalGalones: 0,
          totalDeclarado: 0,
          diferenciasAcumuladas: 0,
          productosActualizados: 0,
          tanquesActualizados: 0,
          cierresExitosos: 0,
          cierresConErrores: 0,
          cierresFallidos: 0,
          puntosVentaUnicos: new Set(),
          usuariosUnicos: new Set(),
          cierresDetalle: []
        };
      }

      const grupo = acc[clave];
      grupo.totalCierres++;
      grupo.valorTotalGeneral += Number(cierre.valorTotalGeneral);
      grupo.totalLitros += Number(cierre.totalVentasLitros);
      grupo.totalGalones += Number(cierre.totalVentasGalones);
      grupo.totalDeclarado += Number(cierre.totalDeclarado);
      grupo.diferenciasAcumuladas += Number(cierre.diferencia);
      grupo.productosActualizados += cierre.productosActualizados;
      grupo.tanquesActualizados += cierre.tanquesActualizados;

      // Contar estados
      if (cierre.estado === 'exitoso') grupo.cierresExitosos++;
      else if (cierre.estado === 'con_errores') grupo.cierresConErrores++;
      else grupo.cierresFallidos++;

      // Agregar puntos de venta y usuarios únicos
      if (cierre.turno.puntoVenta) {
        grupo.puntosVentaUnicos.add(cierre.turno.puntoVenta.nombre);
      }
      grupo.usuariosUnicos.add(`${cierre.usuario.nombre} ${cierre.usuario.apellido}`);

      // Agregar detalle del cierre
      grupo.cierresDetalle.push({
        id: cierre.id,
        fechaCierre: cierre.fechaCierre,
        estado: cierre.estado,
        valorTotal: Number(cierre.valorTotalGeneral),
        usuario: `${cierre.usuario.nombre} ${cierre.usuario.apellido}`,
        puntoVenta: cierre.turno.puntoVenta?.nombre || 'No identificado'
      });

      return acc;
    }, {} as Record<string, any>);

    // Convertir Sets a arrays y calcular estadísticas finales
    const estadisticasPorPeriodo = Object.values(datosAgrupados).map((grupo: any) => ({
      periodo: grupo.periodo,
      totalCierres: grupo.totalCierres,
      valorTotalGeneral: grupo.valorTotalGeneral,
      totalLitros: grupo.totalLitros,
      totalGalones: grupo.totalGalones,
      totalDeclarado: grupo.totalDeclarado,
      diferenciasAcumuladas: grupo.diferenciasAcumuladas,
      productosActualizados: grupo.productosActualizados,
      tanquesActualizados: grupo.tanquesActualizados,
      cierresExitosos: grupo.cierresExitosos,
      cierresConErrores: grupo.cierresConErrores,
      cierresFallidos: grupo.cierresFallidos,
      puntosVentaUnicos: Array.from(grupo.puntosVentaUnicos) as string[],
      usuariosUnicos: Array.from(grupo.usuariosUnicos) as string[],
      cantidadPuntosVentaUnicos: grupo.puntosVentaUnicos.size,
      cantidadUsuariosUnicos: grupo.usuariosUnicos.size,
      promedioValorPorCierre: grupo.totalCierres > 0 ? grupo.valorTotalGeneral / grupo.totalCierres : 0,
      porcentajeExitosos: grupo.totalCierres > 0 ? (grupo.cierresExitosos / grupo.totalCierres) * 100 : 0,
      cierresDetalle: grupo.cierresDetalle
    }));

    const resumenGeneral: EstadisticasCierresPorPeriodoResponse = {
      // === METADATOS ===
      metadatos: {
        fechaDesde,
        fechaHasta,
        agruparPor,
        periodosEncontrados: estadisticasPorPeriodo.length,
        fechaGeneracion: new Date()
      },

      // === TOTALES GENERALES ===
      totalesGenerales: {
        totalCierres: estadisticasPorPeriodo.reduce((sum, p) => sum + p.totalCierres, 0),
        valorTotalGeneral: estadisticasPorPeriodo.reduce((sum, p) => sum + p.valorTotalGeneral, 0),
        totalLitros: estadisticasPorPeriodo.reduce((sum, p) => sum + p.totalLitros, 0),
        totalGalones: estadisticasPorPeriodo.reduce((sum, p) => sum + p.totalGalones, 0),
        diferenciasAcumuladas: estadisticasPorPeriodo.reduce((sum, p) => sum + p.diferenciasAcumuladas, 0),
        cierresExitosos: estadisticasPorPeriodo.reduce((sum, p) => sum + p.cierresExitosos, 0),
        cierresConErrores: estadisticasPorPeriodo.reduce((sum, p) => sum + p.cierresConErrores, 0),
        cierresFallidos: estadisticasPorPeriodo.reduce((sum, p) => sum + p.cierresFallidos, 0)
      },

      // === ESTADÍSTICAS POR PERÍODO ===
      estadisticasPorPeriodo: estadisticasPorPeriodo
    };

    return resumenGeneral;
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