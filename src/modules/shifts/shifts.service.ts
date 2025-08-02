import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateShiftInput } from './dto/create-shift.input';
import { UpdateShiftInput } from './dto/update-shift.input';
import { Shift } from './entities/shift.entity';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper method to format Shift
  private formatShift(shift: any): Shift {
    return {
      id: shift.id,
      startDate: new Date(shift.fechaInicio),
      endDate: shift.fechaFin ? new Date(shift.fechaFin) : null,
      startTime: shift.horaInicio,
      endTime: shift.horaFin,
      observations: shift.observaciones,
      active: shift.activo,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
      userId: shift.usuarioId,
      user: shift.usuario,
      puntoVentaId: shift.puntoVentaId,
      puntoVenta: shift.puntoVenta,
    } as Shift;
  }

  async create(createShiftInput: CreateShiftInput): Promise<Shift> {
    const shift = await this.prisma.turno.create({
      data: {
        fechaInicio: new Date(createShiftInput.startDate),
        fechaFin: createShiftInput.endDate ? new Date(createShiftInput.endDate) : null,
        horaInicio: createShiftInput.startTime,
        horaFin: createShiftInput.endTime,
        observaciones: createShiftInput.observations,
        activo: createShiftInput.active ?? true,
        puntoVenta: {
          connect: { id: createShiftInput.puntoVentaId }
        },
        ...(createShiftInput.userId && {
          usuario: {
            connect: { id: createShiftInput.userId }
          }
        }),
      },
      include: {
        puntoVenta: true,
        usuario: {
          include: {
            rol: true,
          }
        },
      },
    });

    return this.formatShift(shift);
  }

  async findAll(filters?: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    active?: boolean;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters?.userId) {
        where.usuarioId = filters.userId;
      }

      if (filters?.startDate || filters?.endDate) {
        where.fechaInicio = {};
        if (filters.startDate) {
          where.fechaInicio.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.fechaInicio.lte = filters.endDate;
        }
      }

      if (filters?.active !== undefined) {
        where.activo = filters.active;
      }

      const [shifts, total] = await Promise.all([
        this.prisma.turno.findMany({
          where,
          include: {
            usuario: true,
          },
          orderBy: { fechaInicio: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.turno.count({ where }),
      ]);

      return {
        shifts: shifts.map(shift => this.formatShift(shift)),
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error querying shifts: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Shift | null> {
    try {
      const shift = await this.prisma.turno.findUnique({
        where: { id },
        include: {
          usuario: true,
        },
      });

      return shift ? this.formatShift(shift) : null;
    } catch (error) {
      throw new Error(`Error querying shift: ${error.message}`);
    }
  }

  async update(id: string, updateShiftInput: UpdateShiftInput): Promise<Shift> {
    try {
      const existingShift = await this.findById(id);
      if (!existingShift) {
        throw new NotFoundException('Shift not found');
      }

      // If changing the user, verify that it exists
      if (updateShiftInput.userId) {
        const user = await this.prisma.usuario.findUnique({
          where: { id: updateShiftInput.userId },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }
      }

      const updateData: any = {};

      if (updateShiftInput.startDate) {
        updateData.fechaInicio = new Date(updateShiftInput.startDate);
      }

      if (updateShiftInput.endDate) {
        updateData.fechaFin = new Date(updateShiftInput.endDate);
      }

      if (updateShiftInput.startTime) {
        updateData.horaInicio = updateShiftInput.startTime;
      }

      if (updateShiftInput.endTime) {
        updateData.horaFin = updateShiftInput.endTime;
      }

      if (updateShiftInput.observations !== undefined) {
        updateData.observaciones = updateShiftInput.observations;
      }

      if (updateShiftInput.userId) {
        updateData.usuarioId = updateShiftInput.userId;
      }

      if (updateShiftInput.active !== undefined) {
        updateData.activo = updateShiftInput.active;
      }

      const shift = await this.prisma.turno.update({
        where: { id },
        data: updateData,
        include: {
          usuario: true,
        },
      });

      return this.formatShift(shift);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error updating shift: ${error.message}`);
    }
  }

  async remove(id: string): Promise<Shift> {
    try {
      const existingShift = await this.findById(id);
      if (!existingShift) {
        throw new NotFoundException('Shift not found');
      }

      // Verify if there are associated shift closures
      /* 
      const closuresCount = await this.prisma.cierreTurno.count({
        where: { turnoId: id },
      });

      if (closuresCount > 0) {
        throw new ConflictException('Cannot delete shift because it has associated closures');
      }
      */

      const shift = await this.prisma.turno.delete({
        where: { id },
        include: {
          usuario: true,
        },
      });

      return this.formatShift(shift);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Error deleting shift: ${error.message}`);
    }
  }

  async getActiveShifts() {
    try {
      const activeShifts = await this.prisma.turno.findMany({
        where: {
          activo: true,
          fechaFin: null, // Shifts without end date are considered active
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              username: true,
            },
          },
        },
        orderBy: { fechaInicio: 'desc' },
      });

      return {
        activeShifts: activeShifts.length,
        shifts: activeShifts.map(shift => this.formatShift(shift)),
      };
    } catch (error) {
      throw new Error(`Error querying active shifts: ${error.message}`);
    }
  }

  async closeShift(id: string): Promise<Shift> {
    try {
      const shift = await this.update(id, {
        endDate: new Date().toISOString(),
        active: false,
      });

      return shift;
    } catch (error) {
      throw new Error(`Error closing shift: ${error.message}`);
    }
  }

  async getShiftsByUser(userId: string) {
    try {
      const shifts = await this.prisma.turno.findMany({
        where: { usuarioId: userId },
        include: {
          usuario: true,
        },
        orderBy: { fechaInicio: 'desc' },
      });

      return shifts.map(shift => this.formatShift(shift));
    } catch (error) {
      throw new Error(`Error querying user shifts: ${error.message}`);
    }
  }
} 