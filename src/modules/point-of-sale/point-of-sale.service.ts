import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreatePointOfSaleDto } from './dto/create-point-of-sale.dto';
import { UpdatePointOfSaleDto } from './dto/update-point-of-sale.dto';
import { PointOfSale } from './entities/point-of-sale.entity';

@Injectable()
export class PointOfSaleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPointOfSaleDto: CreatePointOfSaleDto): Promise<PointOfSale> {
    // Verificar si el código ya existe
    const existingPointOfSale = await this.prisma.puntoVenta.findUnique({
      where: { codigo: createPointOfSaleDto.codigo },
    });

    if (existingPointOfSale) {
      throw new ConflictException('El código ya está en uso');
    }

    // Verificar que la empresa existe
    const company = await this.prisma.empresa.findUnique({
      where: { id: createPointOfSaleDto.empresaId },
    });

    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const pointOfSale = await this.prisma.puntoVenta.create({
      data: {
        ...createPointOfSaleDto,
        fechaApertura: createPointOfSaleDto.fechaApertura 
          ? new Date(createPointOfSaleDto.fechaApertura) 
          : null,
      },
      include: {
        empresa: true,
      },
    });

    return pointOfSale as PointOfSale;
  }

  async findAll(): Promise<PointOfSale[]> {
    const pointsOfSale = await this.prisma.puntoVenta.findMany({
      include: {
        empresa: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pointsOfSale as PointOfSale[];
  }

  async findByCompany(empresaId: string): Promise<PointOfSale[]> {
    const pointsOfSale = await this.prisma.puntoVenta.findMany({
      where: { empresaId },
      include: {
        empresa: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pointsOfSale as PointOfSale[];
  }

  async findById(id: string): Promise<PointOfSale | null> {
    const pointOfSale = await this.prisma.puntoVenta.findUnique({
      where: { id },
      include: {
        empresa: true,
      },
    });

    return pointOfSale as PointOfSale | null;
  }

  async findByCodigo(codigo: string): Promise<PointOfSale | null> {
    const pointOfSale = await this.prisma.puntoVenta.findUnique({
      where: { codigo },
      include: {
        empresa: true,
      },
    });

    return pointOfSale as PointOfSale | null;
  }

  async update(updatePointOfSaleDto: UpdatePointOfSaleDto): Promise<PointOfSale> {
    const { id, ...updateData } = updatePointOfSaleDto;
    
    const existingPointOfSale = await this.findById(id);
    
    if (!existingPointOfSale) {
      throw new NotFoundException('Punto de venta no encontrado');
    }

    // Si se está actualizando el código, verificar que no exista
    if (updateData.codigo && updateData.codigo !== existingPointOfSale.codigo) {
      const codigoExists = await this.prisma.puntoVenta.findUnique({
        where: { codigo: updateData.codigo },
      });

      if (codigoExists) {
        throw new ConflictException('El código ya está en uso');
      }
    }

    // Si se está actualizando la empresa, verificar que existe
    if (updateData.empresaId && updateData.empresaId !== existingPointOfSale.empresaId) {
      const company = await this.prisma.empresa.findUnique({
        where: { id: updateData.empresaId },
      });

      if (!company) {
        throw new NotFoundException('Empresa no encontrada');
      }
    }

    const pointOfSale = await this.prisma.puntoVenta.update({
      where: { id },
      data: {
        ...updateData,
        fechaApertura: updateData.fechaApertura 
          ? new Date(updateData.fechaApertura) 
          : undefined,
      },
      include: {
        empresa: true,
      },
    });

    return pointOfSale as PointOfSale;
  }

  async remove(id: string): Promise<PointOfSale> {
    const existingPointOfSale = await this.findById(id);
    
    if (!existingPointOfSale) {
      throw new NotFoundException('Punto de venta no encontrado');
    }

    // Verificar si hay usuarios asociados a este punto de venta
    const userCount = await this.prisma.usuario.count({
      where: { 
        puntosVenta: {
          some: {
            id: id
          }
        }
      },
    });

    if (userCount > 0) {
      throw new ConflictException('No se puede eliminar el punto de venta porque tiene usuarios asociados');
    }

    const pointOfSale = await this.prisma.puntoVenta.delete({
      where: { id },
      include: {
        empresa: true,
      },
    });

    return {
      id: pointOfSale.id,
      codigo: pointOfSale.codigo,
      nombre: pointOfSale.nombre,
      descripcion: pointOfSale.descripcion,
      direccion: pointOfSale.direccion,
      ciudad: pointOfSale.ciudad,
      provincia: pointOfSale.provincia,
      pais: pointOfSale.pais,
      codigoPostal: pointOfSale.codigoPostal,
      telefono: pointOfSale.telefono,
      telefonoMovil: pointOfSale.telefonoMovil,
      email: pointOfSale.email,
      horarioApertura: pointOfSale.horarioApertura,
      horarioCierre: pointOfSale.horarioCierre,
      diasAtencion: pointOfSale.diasAtencion,
      coordenadasGPS: pointOfSale.coordenadasGPS,
      tipoEstacion: pointOfSale.tipoEstacion,
      serviciosAdicionales: pointOfSale.serviciosAdicionales,
      capacidadMaxima: pointOfSale.capacidadMaxima,
      fechaApertura: pointOfSale.fechaApertura,
      activo: pointOfSale.activo,
      createdAt: pointOfSale.createdAt,
      updatedAt: pointOfSale.updatedAt,
      empresaId: pointOfSale.empresaId,
      empresa: {
        id: pointOfSale.empresa.id,
        rut: pointOfSale.empresa.rut,
        razonSocial: pointOfSale.empresa.razonSocial,
        nombreComercial: pointOfSale.empresa.nombreComercial,
        nombre: pointOfSale.empresa.nombre,
        direccion: pointOfSale.empresa.direccion,
        ciudad: pointOfSale.empresa.ciudad,
        provincia: pointOfSale.empresa.provincia,
        pais: pointOfSale.empresa.pais,
        codigoPostal: pointOfSale.empresa.codigoPostal,
        telefono: pointOfSale.empresa.telefono,
        telefonoMovil: pointOfSale.empresa.telefonoMovil,
        email: pointOfSale.empresa.email,
        sitioWeb: pointOfSale.empresa.sitioWeb,
        logo: pointOfSale.empresa.logo,
        sector: pointOfSale.empresa.sector,
        tipoEmpresa: pointOfSale.empresa.tipoEmpresa,
        fechaConstitucion: pointOfSale.empresa.fechaConstitucion,
        activo: pointOfSale.empresa.activo,
        createdAt: pointOfSale.empresa.createdAt,
        updatedAt: pointOfSale.empresa.updatedAt,
        puntosVenta: [],
      },
    };
  }

  async toggleStatus(id: string): Promise<PointOfSale> {
    const existingPointOfSale = await this.findById(id);
    
    if (!existingPointOfSale) {
      throw new NotFoundException('Punto de venta no encontrado');
    }

    const pointOfSale = await this.prisma.puntoVenta.update({
      where: { id },
      data: {
        activo: !existingPointOfSale.activo,
      },
      include: {
        empresa: true,
      },
    });

    return pointOfSale as PointOfSale;
  }
} 