import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateTanqueInput, CreateTablaAforoInput } from './dto/create-tanque.input';
import { UpdateTanqueInput } from './dto/update-tanque.input';
import { Tanque, TanqueWithStatus } from './entities/tanque.entity';

@Injectable()
export class TanquesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo tanque
   */
  async create(createTanqueInput: CreateTanqueInput): Promise<Tanque> {
    // Verificar si el número ya existe en el punto de venta
    const existingTanque = await this.prisma.tanque.findFirst({
      where: { 
        numero: createTanqueInput.numero,
        puntoVentaId: createTanqueInput.puntoVentaId 
      },
    });

    if (existingTanque) {
      throw new ConflictException('Ya existe un tanque con este número en este punto de venta');
    }

    // Validar que el producto existe
    const producto = await this.prisma.producto.findUnique({
      where: { id: createTanqueInput.productoId }
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Validar que el punto de venta existe
    const puntoVenta = await this.prisma.puntoVenta.findUnique({
      where: { id: createTanqueInput.puntoVentaId }
    });

    if (!puntoVenta) {
      throw new NotFoundException('Punto de venta no encontrado');
    }

    // Crear el tanque
    const tanque = await this.prisma.tanque.create({
      data: {
        numero: createTanqueInput.numero,
        capacidadTotal: createTanqueInput.capacidadTotal,
        nivelActual: createTanqueInput.nivelActual ?? 0,
        nivelMinimo: createTanqueInput.nivelMinimo ?? 0,
        diametro: createTanqueInput.diametro,
        alturaMaxima: createTanqueInput.alturaMaxima,
        tipoTanque: createTanqueInput.tipoTanque ?? 'CILINDRICO',
        activo: createTanqueInput.activo ?? true,
        productoId: createTanqueInput.productoId,
        puntoVentaId: createTanqueInput.puntoVentaId,
      },
      include: {
        producto: true,
        puntoVenta: true,
        tablaAforo: true,
      },
    });

    // Si se debe generar tabla de aforo automática
    if (createTanqueInput.generarTablaAforoAutomatica && createTanqueInput.diametro && createTanqueInput.alturaMaxima) {
      await this.generarTablaAforoAutomatica(tanque.id, createTanqueInput.diametro, createTanqueInput.alturaMaxima);
    }

    // Si se proporcionó tabla de aforo manual
    if (createTanqueInput.tablaAforo && createTanqueInput.tablaAforo.length > 0) {
      await this.crearTablaAforo(tanque.id, createTanqueInput.tablaAforo);
    }

    return this.findOne(tanque.id);
  }

  /**
   * Buscar todos los tanques con filtros
   */
  async findAll(puntoVentaId?: string, productoId?: string, activo?: boolean): Promise<Tanque[]> {
    const tanques = await this.prisma.tanque.findMany({
      where: {
        ...(puntoVentaId && { puntoVentaId }),
        ...(productoId && { productoId }),
        ...(activo !== undefined && { activo }),
      },
      include: {
        producto: true,
        puntoVenta: true,
        tablaAforo: {
          orderBy: { altura: 'asc' }
        },
      },
      orderBy: { numero: 'asc' },
    });

    return tanques.map(tanque => this.mapTanqueWithCalculations(tanque));
  }

  /**
   * Buscar un tanque por ID
   */
  async findOne(id: string): Promise<Tanque> {
    const tanque = await this.prisma.tanque.findUnique({
      where: { id },
      include: {
        producto: true,
        puntoVenta: true,
        tablaAforo: {
          orderBy: { altura: 'asc' }
        },
      },
    });

    if (!tanque) {
      throw new NotFoundException('Tanque no encontrado');
    }

    return this.mapTanqueWithCalculations(tanque);
  }

  /**
   * Buscar tanques por punto de venta
   */
  async findByPuntoVenta(puntoVentaId: string): Promise<Tanque[]> {
    return this.findAll(puntoVentaId);
  }

  /**
   * Actualizar un tanque
   */
  async update(id: string, updateTanqueInput: UpdateTanqueInput): Promise<Tanque> {
    const existingTanque = await this.prisma.tanque.findUnique({
      where: { id }
    });

    if (!existingTanque) {
      throw new NotFoundException('Tanque no encontrado');
    }

    // Si se está cambiando el número, verificar que no exista otro con el mismo número en el punto de venta
    if (updateTanqueInput.numero && updateTanqueInput.numero !== existingTanque.numero) {
      const duplicateTanque = await this.prisma.tanque.findFirst({
        where: { 
          numero: updateTanqueInput.numero,
          puntoVentaId: existingTanque.puntoVentaId,
          id: { not: id }
        },
      });

      if (duplicateTanque) {
        throw new ConflictException('Ya existe un tanque con este número en este punto de venta');
      }
    }

    const tanque = await this.prisma.tanque.update({
      where: { id },
      data: {
        ...(updateTanqueInput.numero && { numero: updateTanqueInput.numero }),
        ...(updateTanqueInput.capacidadTotal !== undefined && { capacidadTotal: updateTanqueInput.capacidadTotal }),
        ...(updateTanqueInput.nivelActual !== undefined && { nivelActual: updateTanqueInput.nivelActual }),
        ...(updateTanqueInput.nivelMinimo !== undefined && { nivelMinimo: updateTanqueInput.nivelMinimo }),
        ...(updateTanqueInput.diametro !== undefined && { diametro: updateTanqueInput.diametro }),
        ...(updateTanqueInput.alturaMaxima !== undefined && { alturaMaxima: updateTanqueInput.alturaMaxima }),
        ...(updateTanqueInput.tipoTanque && { tipoTanque: updateTanqueInput.tipoTanque }),
        ...(updateTanqueInput.activo !== undefined && { activo: updateTanqueInput.activo }),
        ...(updateTanqueInput.productoId && { productoId: updateTanqueInput.productoId }),
      },
      include: {
        producto: true,
        puntoVenta: true,
        tablaAforo: {
          orderBy: { altura: 'asc' }
        },
      },
    });

    return this.mapTanqueWithCalculations(tanque);
  }

  /**
   * Eliminar un tanque
   */
  async remove(id: string): Promise<boolean> {
    const tanque = await this.prisma.tanque.findUnique({
      where: { id }
    });

    if (!tanque) {
      throw new NotFoundException('Tanque no encontrado');
    }

    // Verificar que no haya entradas de inventario asociadas
    const entradasInventario = await this.prisma.entradaInventario.count({
      where: { tanqueId: id }
    });

    if (entradasInventario > 0) {
      throw new ConflictException('No se puede eliminar el tanque porque tiene entradas de inventario asociadas');
    }

    await this.prisma.tanque.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Actualizar nivel del tanque
   */
  async updateLevel(id: string, nuevoNivel: number): Promise<Tanque> {
    const tanque = await this.prisma.tanque.findUnique({
      where: { id }
    });

    if (!tanque) {
      throw new NotFoundException('Tanque no encontrado');
    }

    const capacidadTotal = parseFloat(tanque.capacidadTotal.toString());
    
    if (nuevoNivel > capacidadTotal) {
      throw new BadRequestException('El nivel excede la capacidad del tanque');
    }

    if (nuevoNivel < 0) {
      throw new BadRequestException('El nivel no puede ser negativo');
    }

    return this.update(id, { id, nivelActual: nuevoNivel });
  }

  /**
   * Obtener estado de todos los tanques con alertas
   */
  async getTankStatusByPuntoVenta(puntoVentaId: string): Promise<TanqueWithStatus[]> {
    const tanques = await this.findByPuntoVenta(puntoVentaId);

    return tanques.map(tanque => {
      const porcentajeLlenado = this.calcularPorcentajeLlenado(tanque);
      const estado = this.determinarEstadoTanque(porcentajeLlenado);
      const requiereAbastecimiento = porcentajeLlenado <= 20; // Menos del 20%

      return {
        tanque,
        estado,
        porcentajeLlenado,
        requiereAbastecimiento,
      };
    });
  }

  /**
   * Calcular volumen basado en altura usando la fórmula: PI * (diametro/2)^2 * altura * 10
   */
  calculateVolumeByHeight(diametro: number, altura: number): number {
    if (!diametro || !altura) {
      throw new BadRequestException('Diámetro y altura son requeridos para el cálculo');
    }

    const radio = diametro / 2;
    const area = Math.PI * Math.pow(radio, 2);
    const volumen = area * altura * 10; // La fórmula incluye * 10

    return Math.round(volumen * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Generar tabla de aforo automática basada en diámetro y altura máxima
   */
  async generarTablaAforoAutomatica(tanqueId: string, diametro: number, alturaMaxima: number): Promise<void> {
    const incremento = 1; // Incremento de 1 cm
    const tablaAforo: CreateTablaAforoInput[] = [];

    // Generar entradas cada 1 cm hasta la altura máxima
    for (let altura = 0; altura <= alturaMaxima * 100; altura += incremento) { // Convertir metros a cm
      const volumen = this.calculateVolumeByHeight(diametro, altura / 100); // Convertir cm a metros para cálculo
      
      tablaAforo.push({
        altura: altura,
        volumen: volumen,
      });
    }

    await this.crearTablaAforo(tanqueId, tablaAforo);
  }

  /**
   * Crear registros de tabla de aforo
   */
  async crearTablaAforo(tanqueId: string, tablaAforo: CreateTablaAforoInput[]): Promise<void> {
    // Eliminar tabla de aforo existente
    await this.prisma.tablaAforo.deleteMany({
      where: { tanqueId }
    });

    // Crear nueva tabla de aforo
    const createData = tablaAforo.map(entrada => ({
      tanqueId,
      altura: entrada.altura,
      volumen: entrada.volumen,
    }));

    await this.prisma.tablaAforo.createMany({
      data: createData
    });
  }

  /**
   * Obtener volumen basado en altura usando tabla de aforo
   */
  async getVolumeByHeight(tanqueId: string, altura: number): Promise<number> {
    // Buscar entrada exacta en tabla de aforo
    let entrada = await this.prisma.tablaAforo.findFirst({
      where: { 
        tanqueId,
        altura: altura
      }
    });

    if (entrada) {
      return parseFloat(entrada.volumen.toString());
    }

    // Si no hay entrada exacta, interpolar entre valores cercanos
    const entradaMenor = await this.prisma.tablaAforo.findFirst({
      where: { 
        tanqueId,
        altura: { lte: altura }
      },
      orderBy: { altura: 'desc' }
    });

    const entradaMayor = await this.prisma.tablaAforo.findFirst({
      where: { 
        tanqueId,
        altura: { gte: altura }
      },
      orderBy: { altura: 'asc' }
    });

    if (entradaMenor && entradaMayor && entradaMenor.id !== entradaMayor.id) {
      // Interpolación lineal
      const alturaMenor = parseFloat(entradaMenor.altura.toString());
      const alturaMayor = parseFloat(entradaMayor.altura.toString());
      const volumenMenor = parseFloat(entradaMenor.volumen.toString());
      const volumenMayor = parseFloat(entradaMayor.volumen.toString());

      const factor = (altura - alturaMenor) / (alturaMayor - alturaMenor);
      const volumen = volumenMenor + (factor * (volumenMayor - volumenMenor));
      
      return Math.round(volumen * 100) / 100;
    }

    if (entradaMenor) {
      return parseFloat(entradaMenor.volumen.toString());
    }

    if (entradaMayor) {
      return parseFloat(entradaMayor.volumen.toString());
    }

    throw new NotFoundException('No se pudo determinar el volumen para la altura especificada');
  }

  /**
   * Mapear tanque con cálculos adicionales
   */
  private mapTanqueWithCalculations(tanque: any): Tanque {
    const nivelPorcentaje = this.calcularPorcentajeLlenado(tanque);
    
    return {
      ...tanque,
      nivelPorcentaje,
      volumenActualPorAltura: tanque.tablaAforo?.length > 0 ? 
        this.calcularVolumenPorTablaAforo(tanque, parseFloat(tanque.nivelActual.toString())) : 
        undefined,
      capacidadTotal: parseFloat(tanque.capacidadTotal.toString()),
      nivelActual: parseFloat(tanque.nivelActual.toString()),
      nivelMinimo: parseFloat(tanque.nivelMinimo.toString()),
      diametro: tanque.diametro ? parseFloat(tanque.diametro.toString()) : undefined,
      alturaMaxima: tanque.alturaMaxima ? parseFloat(tanque.alturaMaxima.toString()) : undefined,
    };
  }

  /**
   * Calcular porcentaje de llenado
   */
  private calcularPorcentajeLlenado(tanque: any): number {
    const capacidadTotal = parseFloat(tanque.capacidadTotal.toString());
    const nivelActual = parseFloat(tanque.nivelActual.toString());
    
    if (capacidadTotal === 0) return 0;
    
    return Math.round((nivelActual / capacidadTotal) * 100 * 100) / 100;
  }

  /**
   * Determinar estado del tanque basado en porcentaje
   */
  private determinarEstadoTanque(porcentajeLlenado: number): string {
    if (porcentajeLlenado >= 50) return 'NORMAL';
    if (porcentajeLlenado >= 20) return 'BAJO';
    if (porcentajeLlenado > 0) return 'CRITICO';
    return 'VACIO';
  }

  /**
   * Calcular volumen basado en tabla de aforo
   */
  private calcularVolumenPorTablaAforo(tanque: any, altura: number): number {
    if (!tanque.tablaAforo || tanque.tablaAforo.length === 0) {
      return 0;
    }

    // Buscar entrada exacta
    const entrada = tanque.tablaAforo.find((entry: any) => parseFloat(entry.altura.toString()) === altura);
    if (entrada) {
      return parseFloat(entrada.volumen.toString());
    }

    // Interpolación entre valores cercanos
    const entradas = tanque.tablaAforo
      .map((entry: any) => ({
        altura: parseFloat(entry.altura.toString()),
        volumen: parseFloat(entry.volumen.toString())
      }))
      .sort((a: any, b: any) => a.altura - b.altura);

    for (let i = 0; i < entradas.length - 1; i++) {
      if (altura >= entradas[i].altura && altura <= entradas[i + 1].altura) {
        const factor = (altura - entradas[i].altura) / (entradas[i + 1].altura - entradas[i].altura);
        return entradas[i].volumen + (factor * (entradas[i + 1].volumen - entradas[i].volumen));
      }
    }

    return 0;
  }

  /**
   * Importar tabla de aforo desde datos CSV
   */
  async importAforoFromCSV(tanqueId: string, csvData: string): Promise<void> {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    
    if (headers.length < 2 || !headers.includes('altura') || !headers.includes('volumen')) {
      throw new BadRequestException('El CSV debe tener columnas "altura" y "volumen"');
    }

    const alturaIndex = headers.indexOf('altura');
    const volumenIndex = headers.indexOf('volumen');
    
    const tablaAforo: CreateTablaAforoInput[] = [];

    // Procesar líneas de datos (saltar header)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      
      if (values.length >= 2) {
        const altura = parseFloat(values[alturaIndex]);
        const volumen = parseFloat(values[volumenIndex]);
        
        if (!isNaN(altura) && !isNaN(volumen)) {
          tablaAforo.push({ altura, volumen });
        }
      }
    }

    if (tablaAforo.length === 0) {
      throw new BadRequestException('No se encontraron datos válidos en el CSV');
    }

    await this.crearTablaAforo(tanqueId, tablaAforo);
  }

  /**
   * Crear entradas masivas de tabla de aforo
   */
  async bulkCreateAforo(tanqueId: string, entradas: CreateTablaAforoInput[]): Promise<void> {
    if (entradas.length === 0) {
      throw new BadRequestException('Se requiere al menos una entrada');
    }

    // Validar que el tanque existe
    const tanque = await this.prisma.tanque.findUnique({
      where: { id: tanqueId }
    });

    if (!tanque) {
      throw new NotFoundException('Tanque no encontrado');
    }

    await this.crearTablaAforo(tanqueId, entradas);
  }

  /**
   * Obtener tabla de aforo completa de un tanque
   */
  async getTablaAforo(tanqueId: string): Promise<any[]> {
    const tablaAforo = await this.prisma.tablaAforo.findMany({
      where: { tanqueId },
      orderBy: { altura: 'asc' }
    });

    return tablaAforo.map(entrada => ({
      ...entrada,
      altura: parseFloat(entrada.altura.toString()),
      volumen: parseFloat(entrada.volumen.toString())
    }));
  }

  /**
   * Eliminar tabla de aforo de un tanque
   */
  async eliminarTablaAforo(tanqueId: string): Promise<boolean> {
    const tanque = await this.prisma.tanque.findUnique({
      where: { id: tanqueId }
    });

    if (!tanque) {
      throw new NotFoundException('Tanque no encontrado');
    }

    await this.prisma.tablaAforo.deleteMany({
      where: { tanqueId }
    });

    return true;
  }

  /**
   * Generar tabla de aforo con parámetros personalizados
   */
  async generarTablaAforoConParametros(
    tanqueId: string, 
    diametro: number, 
    alturaMaxima: number, 
    incremento: number = 1
  ): Promise<void> {
    const tablaAforo: CreateTablaAforoInput[] = [];

    // Generar entradas con el incremento especificado
    for (let altura = 0; altura <= alturaMaxima * 100; altura += incremento) {
      const volumen = this.calculateVolumeByHeight(diametro, altura / 100);
      
      tablaAforo.push({
        altura: altura,
        volumen: volumen,
      });
    }

    await this.crearTablaAforo(tanqueId, tablaAforo);
  }

  /**
   * Exportar tabla de aforo a CSV
   */
  async exportAforoToCSV(tanqueId: string): Promise<string> {
    const tablaAforo = await this.getTablaAforo(tanqueId);
    
    if (tablaAforo.length === 0) {
      throw new NotFoundException('No hay tabla de aforo para este tanque');
    }

    let csv = 'altura,volumen\n';
    
    tablaAforo.forEach(entrada => {
      csv += `${entrada.altura},${entrada.volumen}\n`;
    });

    return csv;
  }

  /**
   * Validar tabla de aforo (buscar inconsistencias)
   */
  async validarTablaAforo(tanqueId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const tablaAforo = await this.getTablaAforo(tanqueId);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (tablaAforo.length === 0) {
      errors.push('No hay tabla de aforo');
      return { isValid: false, errors, warnings };
    }

    // Verificar orden ascendente de alturas
    for (let i = 1; i < tablaAforo.length; i++) {
      if (tablaAforo[i].altura <= tablaAforo[i - 1].altura) {
        errors.push(`Altura en posición ${i} no es mayor que la anterior`);
      }
    }

    // Verificar que volúmenes sean crecientes
    for (let i = 1; i < tablaAforo.length; i++) {
      if (tablaAforo[i].volumen < tablaAforo[i - 1].volumen) {
        warnings.push(`Volumen en altura ${tablaAforo[i].altura}cm es menor que el anterior`);
      }
    }

    // Verificar que inicie en 0
    if (tablaAforo[0].altura !== 0) {
      warnings.push('La tabla no inicia en altura 0');
    }

    if (tablaAforo[0].volumen !== 0) {
      warnings.push('El volumen no inicia en 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 