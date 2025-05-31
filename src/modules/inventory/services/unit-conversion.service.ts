import { Injectable } from '@nestjs/common';

@Injectable()
export class UnitConversionService {
  // Factores de conversión (usando litros como unidad base)
  private readonly conversionFactors = {
    'litros': 1.0,
    'galones': 3.78541,  // 1 galón = 3.78541 litros
    'galones_us': 3.78541,
    'galones_uk': 4.54609, // Galón imperial
    'metros_cubicos': 1000,
    'mililitros': 0.001,
  };

  // Unidad base del sistema
  private readonly baseUnit = 'litros';

  /**
   * Convierte cualquier cantidad a la unidad base (litros)
   */
  convertToBaseUnit(cantidad: number, fromUnit: string): number {
    const factor = this.conversionFactors[fromUnit.toLowerCase()];
    if (!factor) {
      throw new Error(`Unidad no soportada: ${fromUnit}`);
    }
    return cantidad * factor;
  }

  /**
   * Convierte desde la unidad base a cualquier otra unidad
   */
  convertFromBaseUnit(cantidad: number, toUnit: string): number {
    const factor = this.conversionFactors[toUnit.toLowerCase()];
    if (!factor) {
      throw new Error(`Unidad no soportada: ${toUnit}`);
    }
    return cantidad / factor;
  }

  /**
   * Convierte entre dos unidades cualquiera
   */
  convert(cantidad: number, fromUnit: string, toUnit: string): number {
    if (fromUnit.toLowerCase() === toUnit.toLowerCase()) {
      return cantidad;
    }
    
    // Convertir a unidad base y luego a unidad destino
    const baseAmount = this.convertToBaseUnit(cantidad, fromUnit);
    return this.convertFromBaseUnit(baseAmount, toUnit);
  }

  /**
   * Obtiene información de conversión para mostrar en UI
   */
  getConversionInfo(cantidad: number, unit: string) {
    const litros = this.convertToBaseUnit(cantidad, unit);
    const galones = this.convertFromBaseUnit(litros, 'galones');
    
    return {
      original: {
        cantidad,
        unidad: unit
      },
      litros: {
        cantidad: Math.round(litros * 100) / 100,
        unidad: 'litros'
      },
      galones: {
        cantidad: Math.round(galones * 100) / 100,
        unidad: 'galones'
      }
    };
  }

  /**
   * Valida si una unidad es soportada
   */
  isValidUnit(unit: string): boolean {
    return Object.keys(this.conversionFactors).includes(unit.toLowerCase());
  }

  /**
   * Obtiene todas las unidades soportadas
   */
  getSupportedUnits(): string[] {
    return Object.keys(this.conversionFactors);
  }

  /**
   * Formatea cantidad con unidad para mostrar
   */
  formatQuantity(cantidad: number, unit: string): string {
    const rounded = Math.round(cantidad * 100) / 100;
    return `${rounded} ${unit}`;
  }

  /**
   * Obtiene la unidad base del sistema
   */
  getBaseUnit(): string {
    return this.baseUnit;
  }
} 