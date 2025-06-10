# Prueba Práctica del Sistema de Surtidores

## Paso 1: Verificar Surtidores Existentes

```graphql
query VerificarSurtidores {
  surtidores(page: 1, limit: 10, activo: true) {
    surtidores {
      id
      numero
      nombre
      cantidadMangueras
      mangueras {
        numero
        color
        producto {
          codigo
          nombre
        }
      }
    }
    total
  }
}
```

**Resultado Esperado**: 3 surtidores (PUMP-01, PUMP-02, PUMP-03)

> **Nota**: Si no ves surtidores, ejecuta `npx prisma db seed` para crear los datos iniciales.

## Paso 2: Obtener IDs de Productos

```graphql
query ObtenerProductos {
  fuelProducts {
    id
    codigo
    nombre
    precio
    stockActual
  }
}
```

**Resultado Esperado**: Gasolina 95, Diesel, etc.

## Paso 3: Crear Turno de Prueba

```graphql
mutation CrearTurno {
  createShift(createShiftInput: {
    startDate: "2024-01-20T08:00:00Z"
    startTime: "08:00"
    endTime: "16:00"
    userId: "clrn4ohvh0002yqpjgz1mj7h6"  # ID del admin
    observations: "Turno de prueba para validar surtidores"
  }) {
    id
    startDate
    startTime
    endTime
    active
  }
}
```

## Paso 4: Cierre Exitoso (Solo Surtidores Válidos)

```graphql
mutation CierreExitoso {
  processShiftClosure(cierreTurnoInput: {
    turnoId: "TURNO_ID_DEL_PASO_3"
    lecturasSurtidores: [
      {
        numeroSurtidor: "PUMP-01"  # ✅ Existe
        mangueras: [
          {
            numeroManguera: "M1"    # ✅ Existe en PUMP-01
            codigoProducto: "GASOL-95"  # ✅ Coincide con configuración
            lecturaAnterior: 1000.0
            lecturaActual: 1025.5
            unidadMedida: "galones"
          }
          {
            numeroManguera: "M2"    # ✅ Existe en PUMP-01
            codigoProducto: "DIESEL"    # ✅ Coincide con configuración
            lecturaAnterior: 500.0
            lecturaActual: 515.2
            unidadMedida: "galones"
          }
        ]
        observaciones: "Lecturas normales"
      }
    ]
    observacionesGenerales: "Cierre de prueba exitoso"
  }) {
    estado
    errores
    advertencias
    resumenSurtidores {
      numeroSurtidor
      ventas {
        codigoProducto
        nombreProducto
        cantidadVendidaGalones
        cantidadVendidaLitros
        valorTotalVenta
      }
      totalVentasLitros
      valorTotalSurtidor
    }
    totalGeneralLitros
    valorTotalGeneral
    productosActualizados
  }
}
```

**Resultado Esperado**: `estado: "exitoso"`, sin errores

## Paso 5: Cierre con Error - Surtidor Inexistente

```graphql
mutation CierreConErrorSurtidor {
  processShiftClosure(cierreTurnoInput: {
    turnoId: "TURNO_ID_DEL_PASO_3"
    lecturasSurtidores: [
      {
        numeroSurtidor: "PUMP-99"  # ❌ No existe
        mangueras: [
          {
            numeroManguera: "M1"
            codigoProducto: "GASOL-95"
            lecturaAnterior: 1000.0
            lecturaActual: 1025.5
            unidadMedida: "galones"
          }
        ]
      }
    ]
  }) {
    estado
    errores
    productosActualizados
  }
}
```

**Resultado Esperado**: 
```json
{
  "estado": "fallido",
  "errores": ["Surtidor no registrado o inactivo: PUMP-99"],
  "productosActualizados": 0
}
```

## Paso 6: Cierre con Error - Manguera Inexistente

```graphql
mutation CierreConErrorManguera {
  processShiftClosure(cierreTurnoInput: {
    turnoId: "TURNO_ID_DEL_PASO_3"
    lecturasSurtidores: [
      {
        numeroSurtidor: "PUMP-01"  # ✅ Existe
        mangueras: [
          {
            numeroManguera: "M5"    # ❌ PUMP-01 solo tiene M1 y M2
            codigoProducto: "GASOL-95"
            lecturaAnterior: 1000.0
            lecturaActual: 1025.5
            unidadMedida: "galones"
          }
        ]
      }
    ]
  }) {
    estado
    errores
    productosActualizados
  }
}
```

**Resultado Esperado**: 
```json
{
  "estado": "fallido",
  "errores": ["Manguera M5 no válida para surtidor PUMP-01 o producto GASOL-95"],
  "productosActualizados": 0
}
```

## Paso 7: Cierre con Error - Producto Incorrecto

```graphql
mutation CierreConErrorProducto {
  processShiftClosure(cierreTurnoInput: {
    turnoId: "TURNO_ID_DEL_PASO_3"
    lecturasSurtidores: [
      {
        numeroSurtidor: "PUMP-01"
        mangueras: [
          {
            numeroManguera: "M1"      # M1 está configurada para GASOL-95
            codigoProducto: "DIESEL"  # ❌ Producto incorrecto
            lecturaAnterior: 1000.0
            lecturaActual: 1025.5
            unidadMedida: "galones"
          }
        ]
      }
    ]
  }) {
    estado
    errores
    productosActualizados
  }
}
```

**Resultado Esperado**: 
```json
{
  "estado": "fallido",
  "errores": ["Manguera M1 no válida para surtidor PUMP-01 o producto DIESEL"],
  "productosActualizados": 0
}
```

## Paso 8: Crear Nuevo Surtidor

```graphql
mutation CrearNuevoSurtidor {
  createSurtidor(createSurtidorInput: {
    numero: "PUMP-04"
    nombre: "Surtidor de Prueba"
    descripcion: "Surtidor creado para testing"
    ubicacion: "Zona de Pruebas"
    cantidadMangueras: 1
    activo: true
    observaciones: "Surtidor temporal"
    mangueras: [
      {
        numero: "M1"
        color: "Amarillo"
        productoId: "ID_GASOLINA_95_AQUI"  # Usar ID real del paso 2
        activo: true
      }
    ]
  }) {
    id
    numero
    nombre
    mangueras {
      numero
      color
      producto {
        codigo
        nombre
      }
    }
  }
}
```

## Paso 9: Usar Nuevo Surtidor en Cierre

```graphql
mutation UsarNuevoSurtidor {
  processShiftClosure(cierreTurnoInput: {
    turnoId: "TURNO_ID_DEL_PASO_3"
    lecturasSurtidores: [
      {
        numeroSurtidor: "PUMP-04"  # ✅ Recién creado
        mangueras: [
          {
            numeroManguera: "M1"
            codigoProducto: "GASOL-95"
            lecturaAnterior: 0.0
            lecturaActual: 10.5
            unidadMedida: "galones"
          }
        ]
      }
    ]
  }) {
    estado
    errores
    resumenSurtidores {
      numeroSurtidor
      ventas {
        codigoProducto
        cantidadVendidaGalones
        valorTotalVenta
      }
    }
  }
}
```

## Paso 10: Desactivar Surtidor y Probar Error

```graphql
# Primero desactivar
mutation DesactivarSurtidor {
  updateSurtidor(
    id: "ID_SURTIDOR_PUMP_04"
    updateSurtidorInput: {
      activo: false
    }
  ) {
    id
    numero
    activo
  }
}

# Luego intentar usar en cierre
mutation UsarSurtidorInactivo {
  processShiftClosure(cierreTurnoInput: {
    turnoId: "TURNO_ID_DEL_PASO_3"
    lecturasSurtidores: [
      {
        numeroSurtidor: "PUMP-04"  # ❌ Ahora está inactivo
        mangueras: [
          {
            numeroManguera: "M1"
            codigoProducto: "GASOL-95"
            lecturaAnterior: 10.5
            lecturaActual: 20.0
            unidadMedida: "galones"
          }
        ]
      }
    ]
  }) {
    estado
    errores
  }
}
```

**Resultado Esperado**: Error de surtidor inactivo

## Verificación Final

```graphql
query VerificacionFinal {
  # Ver todos los surtidores
  surtidores(page: 1, limit: 10) {
    surtidores {
      numero
      nombre
      activo
      mangueras {
        numero
        producto {
          codigo
        }
      }
    }
  }
  
  # Ver stock actualizado
  fuelProducts {
    codigo
    stockActual
  }
}
```

## Resultados Esperados

1. ✅ **Cierre exitoso** con surtidores válidos
2. ❌ **Error** con surtidor inexistente  
3. ❌ **Error** con manguera inexistente
4. ❌ **Error** con producto incorrecto
5. ✅ **Creación** de nuevo surtidor exitosa
6. ✅ **Uso** del nuevo surtidor en cierre
7. ❌ **Error** al usar surtidor desactivado

Este flujo demuestra que el sistema:
- ✅ Valida existencia de surtidores
- ✅ Valida configuración de mangueras  
- ✅ Valida concordancia de productos
- ✅ Respeta el estado activo/inactivo
- ✅ Permite gestión completa de surtidores 