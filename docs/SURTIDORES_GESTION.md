# Gestión de Surtidores - Sistema de Gasolinera

## Descripción

El sistema de gestión de surtidores permite registrar los surtidores disponibles en el punto de venta y validar que en el proceso de cierre de turno solo se utilicen surtidores y mangueras existentes y activos.

## Características

- **Registro de Surtidores**: Gestionar la información completa de cada surtidor
- **Gestión de Mangueras**: Cada surtidor puede tener múltiples mangueras con productos específicos
- **Validación en Cierre**: Solo se permiten surtidores y mangueras registrados en el sistema
- **Control de Estado**: Surtidores y mangueras pueden activarse/desactivarse
- **Trazabilidad**: Historial completo de operaciones

## Modelos de Datos

### Surtidor
```typescript
{
  id: string
  numero: string           // Número único del surtidor (ej: "PUMP-01")
  nombre: string          // Nombre descriptivo
  descripcion?: string    // Descripción opcional
  ubicacion?: string      // Ubicación física
  cantidadMangueras: number // Número de mangueras
  activo: boolean         // Estado del surtidor
  fechaInstalacion?: Date
  fechaMantenimiento?: Date
  observaciones?: string
  mangueras: MangueraSurtidor[]
}
```

### MangueraSurtidor
```typescript
{
  id: string
  numero: string         // Número de manguera (ej: "M1", "M2")
  color?: string        // Color identificativo
  activo: boolean       // Estado de la manguera
  surtidorId: string    // ID del surtidor padre
  productoId: string    // ID del producto que dispensa
  producto: Producto    // Información del producto
}
```

## API GraphQL

### 1. Crear Surtidor

```graphql
mutation CreateSurtidor {
  createSurtidor(createSurtidorInput: {
    numero: "PUMP-04"
    nombre: "Surtidor Norte"
    descripcion: "Surtidor para zona norte del predio"
    ubicacion: "Zona Norte"
    cantidadMangueras: 3
    activo: true
    fechaInstalacion: "2024-01-20T00:00:00Z"
    observaciones: "Surtidor de alta capacidad"
    mangueras: [
      {
        numero: "M1"
        color: "Verde"
        productoId: "clrn4ohvh0003yqpjgz1mj7h7"  # ID de Gasolina 95
        activo: true
      }
      {
        numero: "M2"
        color: "Negro"
        productoId: "clrn4ohvh0004yqpjgz1mj7h8"  # ID de Diesel
        activo: true
      }
      {
        numero: "M3"
        color: "Azul"
        productoId: "clrn4ohvh0005yqpjgz1mj7h9"  # ID de Gasolina Premium
        activo: true
      }
    ]
  }) {
    id
    numero
    nombre
    cantidadMangueras
    mangueras {
      id
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

### 2. Consultar Surtidores

```graphql
query GetSurtidores {
  surtidores(page: 1, limit: 10, activo: true) {
    surtidores {
      id
      numero
      nombre
      descripcion
      ubicacion
      cantidadMangueras
      activo
      fechaInstalacion
      mangueras {
        id
        numero
        color
        activo
        producto {
          codigo
          nombre
          precio
          esCombustible
        }
      }
    }
    total
    page
    limit
  }
}
```

### 3. Consultar Surtidor Específico

```graphql
query GetSurtidor {
  surtidor(id: "surtidor_id_aqui") {
    id
    numero
    nombre
    descripcion
    ubicacion
    cantidadMangueras
    activo
    observaciones
    mangueras {
      numero
      color
      activo
      producto {
        codigo
        nombre
        precio
        unidadMedida
      }
    }
  }
}
```

### 4. Buscar Surtidor por Número

```graphql
query GetSurtidorByNumber {
  surtidorByNumber(numero: "PUMP-01") {
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

### 5. Actualizar Surtidor

```graphql
mutation UpdateSurtidor {
  updateSurtidor(
    id: "surtidor_id_aqui"
    updateSurtidorInput: {
      nombre: "Surtidor Principal Actualizado"
      descripcion: "Descripción actualizada"
      fechaMantenimiento: "2024-01-25T00:00:00Z"
      observaciones: "Mantenimiento realizado"
      mangueras: [
        {
          numero: "M1"
          color: "Verde Claro"
          productoId: "clrn4ohvh0003yqpjgz1mj7h7"
          activo: true
        }
        {
          numero: "M2"
          color: "Negro Mate"
          productoId: "clrn4ohvh0004yqpjgz1mj7h8"
          activo: true
        }
      ]
    }
  ) {
    id
    numero
    nombre
    mangueras {
      numero
      color
      producto {
        nombre
      }
    }
  }
}
```

## Validaciones en Cierre de Turno

### Proceso con Validación de Surtidores

```graphql
mutation ProcessShiftClosureValidated {
  processShiftClosure(cierreTurnoInput: {
    turnoId: "turno_id_aqui"
    lecturasSurtidores: [
      {
        numeroSurtidor: "PUMP-01"  # ✅ Debe existir y estar activo
        mangueras: [
          {
            numeroManguera: "M1"    # ✅ Debe existir en PUMP-01
            codigoProducto: "GASOL-95"  # ✅ Debe coincidir con producto asignado
            lecturaAnterior: 1000.0
            lecturaActual: 1025.5
            unidadMedida: "galones"
          }
          {
            numeroManguera: "M2"    # ✅ Debe existir en PUMP-01
            codigoProducto: "DIESEL"    # ✅ Debe coincidir con producto asignado
            lecturaAnterior: 500.0
            lecturaActual: 515.2
            unidadMedida: "galones"
          }
        ]
        observaciones: "Lecturas normales"
      }
      {
        numeroSurtidor: "PUMP-02"  # ✅ Debe existir y estar activo
        mangueras: [
          {
            numeroManguera: "M1"
            codigoProducto: "GASOL-95"
            lecturaAnterior: 750.0
            lecturaActual: 780.3
            unidadMedida: "galones"
          }
        ]
      }
    ]
    observacionesGenerales: "Cierre de turno con validaciones"
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
      totalVentasGalones
      valorTotalSurtidor
    }
    totalGeneralLitros
    totalGeneralGalones
    valorTotalGeneral
    productosActualizados
    turnoId
  }
}
```

### Ejemplos de Errores de Validación

#### 1. Surtidor No Registrado
```graphql
# Input con surtidor inexistente
lecturasSurtidores: [
  {
    numeroSurtidor: "PUMP-99"  # ❌ No existe
    mangueras: [...]
  }
]

# Respuesta:
{
  "estado": "fallido",
  "errores": [
    "Surtidor no registrado o inactivo: PUMP-99"
  ],
  "productosActualizados": 0
}
```

#### 2. Manguera No Válida
```graphql
# Input con manguera incorrecta
lecturasSurtidores: [
  {
    numeroSurtidor: "PUMP-01"
    mangueras: [
      {
        numeroManguera: "M5"  # ❌ PUMP-01 solo tiene M1 y M2
        codigoProducto: "GASOL-95"
        # ...
      }
    ]
  }
]

# Respuesta:
{
  "estado": "fallido",
  "errores": [
    "Manguera M5 no válida para surtidor PUMP-01 o producto GASOL-95"
  ]
}
```

#### 3. Producto No Coincide
```graphql
# Input con producto incorrecto para la manguera
lecturasSurtidores: [
  {
    numeroSurtidor: "PUMP-01"
    mangueras: [
      {
        numeroManguera: "M1"  # M1 está configurada para GASOL-95
        codigoProducto: "DIESEL"  # ❌ Producto incorrecto
        # ...
      }
    ]
  }
]

# Respuesta:
{
  "estado": "fallido",
  "errores": [
    "Manguera M1 no válida para surtidor PUMP-01 o producto DIESEL"
  ]
}
```

## Configuración Inicial

### Surtidores Preconfigurados

El sistema viene con 3 surtidores de ejemplo:

1. **PUMP-01** - Surtidor Principal 1
   - M1 (Verde): Gasolina 95
   - M2 (Negro): Diesel

2. **PUMP-02** - Surtidor Principal 2
   - M1 (Verde): Gasolina 95  
   - M2 (Negro): Diesel

3. **PUMP-03** - Surtidor Económico
   - M1 (Verde): Gasolina 95

### Script de Inicialización

```bash
# Ejecutar seed principal (incluye surtidores)
npx prisma db seed
```

Los surtidores se crean automáticamente junto con el resto de datos iniciales del sistema.

## Casos de Uso

### 1. Agregar Nuevo Surtidor
1. Crear surtidor con `createSurtidor`
2. Definir mangueras y productos
3. Activar surtidor
4. Usar en cierres de turno

### 2. Mantenimiento de Surtidor
1. Desactivar surtidor: `updateSurtidor` con `activo: false`
2. Realizar mantenimiento
3. Actualizar fecha de mantenimiento
4. Reactivar surtidor

### 3. Cambio de Configuración de Mangueras
1. Usar `updateSurtidor` con nuevas mangueras
2. Las mangueras anteriores se eliminan automáticamente
3. Se crean las nuevas configuraciones

### 4. Validación en Producción
- El sistema validará automáticamente en cada cierre
- Solo surtidores activos pueden usarse
- Solo mangueras activas pueden reportar lecturas
- El producto debe coincidir con la configuración

## Beneficios

1. **Seguridad**: Previene errores de entrada de datos
2. **Consistencia**: Garantiza que solo se usen equipos registrados
3. **Trazabilidad**: Historial completo de configuraciones
4. **Flexibilidad**: Fácil adición/modificación de surtidores
5. **Control**: Activación/desactivación por mantenimiento

## Consideraciones

- Los surtidores inactivos no pueden usarse en cierres
- Las mangueras inactivas no pueden reportar lecturas  
- Cambiar la configuración de mangueras elimina las anteriores
- Los productos deben existir antes de asignarlos a mangueras
- La cantidad de mangueras debe coincidir con las proporcionadas 