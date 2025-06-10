# Trazabilidad de Cierres de Turno

## Resumen

El sistema ahora guarda automáticamente la trazabilidad completa de cada cierre de turno realizado, permitiendo auditar y consultar históricos de operaciones.

## Tabla `cierres_turno`

Cada vez que se ejecuta `procesarCierreTurno`, se guarda un registro completo en la tabla `turnos.cierres_turno` con:

- **Información básica**: fecha, turno, usuario que realizó el cierre
- **Totales**: litros, galones, valor total vendido
- **Estadísticas**: productos y tanques actualizados
- **Estado**: exitoso, con_errores, fallido
- **Detalles**: errores, advertencias, resumen completo por surtidor
- **Observaciones**: comentarios adicionales del operador

## Consultas Disponibles

### 1. Listar Cierres con Filtros

```graphql
query CierresTurno {
  cierresTurno(
    fechaDesde: "2024-01-01T00:00:00Z"
    fechaHasta: "2024-01-31T23:59:59Z"
    estado: "exitoso"
    page: 1
    limit: 10
  ) {
    cierres {
      id
      fechaCierre
      totalVentasLitros
      totalVentasGalones
      valorTotalGeneral
      productosActualizados
      tanquesActualizados
      estado
      errores
      advertencias
      turnoId
      usuarioId
    }
    total
    page
    limit
  }
}
```

### 2. Consultar Cierre Específico

```graphql
query CierreTurno($id: ID!) {
  cierreTurno(id: $id) {
    id
    fechaCierre
    totalVentasLitros
    totalVentasGalones
    valorTotalGeneral
    productosActualizados
    tanquesActualizados
    estado
    errores
    advertencias
    resumenSurtidores {
      numeroSurtidor
      totalVentasLitros
      totalVentasGalones
      valorTotalSurtidor
      ventas {
        codigoProducto
        nombreProducto
        cantidadVendidaLitros
        cantidadVendidaGalones
        precioUnitarioLitro
        precioUnitarioGalon
        valorTotalVenta
        unidadOriginal
      }
      observaciones
    }
    observacionesGenerales
    turnoId
    usuarioId
  }
}
```

### 3. Cierres por Fecha Específica

```graphql
query CierresTurnoPorFecha($fecha: DateTime!) {
  cierresTurnoPorFecha(fecha: $fecha) {
    id
    fechaCierre
    totalVentasLitros
    totalVentasGalones
    valorTotalGeneral
    estado
    turnoId
    usuarioId
  }
}
```

## Filtros Disponibles

| Filtro | Tipo | Descripción |
|--------|------|-------------|
| `turnoId` | ID | Cierres de un turno específico |
| `fechaDesde` | DateTime | Fecha de inicio del rango |
| `fechaHasta` | DateTime | Fecha de fin del rango |
| `estado` | String | "exitoso", "con_errores", "fallido" |
| `usuarioId` | ID | Cierres realizados por un usuario |
| `page` | Int | Página (paginación) |
| `limit` | Int | Elementos por página |

## Estados de Cierre

### `exitoso`
- No se encontraron errores
- Todos los productos y tanques se actualizaron correctamente

### `con_errores`
- Se procesó parcialmente
- Algunos productos no se encontraron o hubo problemas menores
- Campo `errores` contiene detalles

### `fallido`
- Error general que impidió el procesamiento
- No se actualizó el inventario

## Ejemplos de Uso Práctico

### Auditoría Diaria
```graphql
# Ver todos los cierres de hoy
query CierresHoy {
  cierresTurnoPorFecha(fecha: "2024-01-15") {
    id
    fechaCierre
    estado
    totalVentasLitros
    valorTotalGeneral
    usuarioId
  }
}
```

### Reporte Semanal
```graphql
# Cierres de la semana pasada
query CierresSemana {
  cierresTurno(
    fechaDesde: "2024-01-08T00:00:00Z"
    fechaHasta: "2024-01-14T23:59:59Z"
    limit: 50
  ) {
    cierres {
      fechaCierre
      estado
      totalVentasLitros
      valorTotalGeneral
      productosActualizados
    }
    total
  }
}
```

### Buscar Problemas
```graphql
# Solo cierres con errores
query CierresConErrores {
  cierresTurno(estado: "con_errores", limit: 20) {
    cierres {
      id
      fechaCierre
      errores
      advertencias
      usuarioId
    }
  }
}
```

### Detalle Completo de un Cierre
```graphql
# Ver toda la información de un cierre específico
query DetalleCierre {
  cierreTurno(id: "clrn_abc123") {
    fechaCierre
    estado
    resumenSurtidores {
      numeroSurtidor
      ventas {
        codigoProducto
        nombreProducto
        cantidadVendidaLitros
        valorTotalVenta
      }
      totalVentasLitros
      valorTotalSurtidor
    }
    errores
    advertencias
    observacionesGenerales
  }
}
```

## Configuración

### 1. Ejecutar Migración
```bash
npx prisma db push
# o
npx prisma migrate deploy
```

### 2. Regenerar Cliente Prisma
```bash
npx prisma generate
```

### 3. Activar Funcionalidad
En `ProductsService`, descomentar las líneas marcadas con `TODO` en los métodos:
- `saveCierreTurno`
- `getCierresTurno` 
- `getCierreTurnoById`

## Beneficios

✅ **Auditoría Completa**: Cada operación queda registrada
✅ **Trazabilidad**: Saber quién, cuándo y qué se procesó
✅ **Detección de Problemas**: Identificar patrones de errores
✅ **Reportes Históricos**: Análisis de tendencias
✅ **Cumplimiento**: Evidencia para auditorías externas 