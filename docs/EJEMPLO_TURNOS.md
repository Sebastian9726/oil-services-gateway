# Practical Examples - Shift System

## Step by Step to Get Started

### 1. First: Create a Shift

```graphql
mutation CreateTestShift {
  createShift(createShiftInput: {
    startDate: "2024-01-15T08:00:00Z"
    startTime: "08:00"
    endTime: "16:00"
    userId: "clrn4ohvh0002yqpjgz1mj7h6"  # Change to your user ID
    observations: "Test shift for testing"
  }) {
    id
    startDate
    startTime
    endTime
    active
    user {
      name
      lastName
    }
  }
}
```

**Expected response:**
```json
{
  "data": {
    "createShift": {
      "id": "shift_abc123def456",
      "startDate": "2024-01-15T08:00:00.000Z",
      "startTime": "08:00",
      "endTime": "16:00",
      "active": true,
      "user": {
        "name": "Admin",
        "lastName": "System"
      }
    }
  }
}
```

### 2. Second: Use the Shift in Closure

```graphql
mutation ProcessClosureWithRealShift {
  procesarCierreTurno(cierreTurnoInput: {
    turnoId: "shift_abc123def456"  # USE THE ID OBTAINED FROM STEP 1
    lecturasSurtidores: [
      {
        numeroSurtidor: "PUMP-01"
        mangueras: [
          {
            numeroManguera: "M1"
            codigoProducto: "GASOL-95"
            lecturaAnterior: 100.0
            lecturaActual: 110.0
            unidadMedida: "galones"
          }
        ]
      }
    ]
    observacionesGenerales: "Normal shift closure"
  }) {
    estado
    totalGeneralLitros
    totalGeneralGalones
    valorTotalGeneral
    productosActualizados
    turnoId
    advertencias
    errores
  }
}
```

**Expected successful response:**
```json
{
  "data": {
    "procesarCierreTurno": {
      "estado": "exitoso",
      "totalGeneralLitros": 37.85,
      "totalGeneralGalones": 10,
      "valorTotalGeneral": 150.0,
      "productosActualizados": 1,
      "turnoId": "shift_abc123def456",
      "advertencias": ["Tanks updated: 1"],
      "errores": null
    }
  }
}
```

### 3. Third: View Saved Traceability

```graphql
query ViewShiftClosures {
  cierresTurno(turnoId: "shift_abc123def456") {
    cierres {
      id
      fechaCierre
      estado
      totalVentasLitros
      totalVentasGalones
      valorTotalGeneral
      resumenSurtidores {
        numeroSurtidor
        totalVentasLitros
        ventas {
          codigoProducto
          nombreProducto
          cantidadVendidaLitros
          valorTotalVenta
        }
      }
    }
  }
}
```

## Multiple Shift Management

### Create Shifts for Different Users

```graphql
# Shift 1: Morning User
mutation MorningShift {
  createShift(createShiftInput: {
    startDate: "2024-01-15T06:00:00Z"
    startTime: "06:00"
    endTime: "14:00"
    userId: "morning_user_id"
    observations: "Morning shift 6AM-2PM"
  }) {
    id
    startTime
    endTime
  }
}

# Shift 2: Evening User
mutation EveningShift {
  createShift(createShiftInput: {
    startDate: "2024-01-15T14:00:00Z"
    startTime: "14:00"
    endTime: "22:00"
    userId: "evening_user_id"
    observations: "Evening shift 2PM-10PM"
  }) {
    id
    startTime
    endTime
  }
}

# Shift 3: Night User
mutation NightShift {
  createShift(createShiftInput: {
    startDate: "2024-01-15T22:00:00Z"
    startTime: "22:00"
    endTime: "06:00"
    userId: "night_user_id"
    observations: "Night shift 10PM-6AM"
  }) {
    id
    startTime
    endTime
  }
}
```

### View All Day's Shifts

```graphql
query DayShifts {
  shifts(
    startDate: "2024-01-15T00:00:00Z"
    endDate: "2024-01-15T23:59:59Z"
    limit: 20
  ) {
    shifts {
      id
      startTime
      endTime
      active
      user {
        name
        lastName
        username
      }
      observations
    }
    total
  }
}
```

## Useful Queries for Administration

### 1. View Active Shifts

```graphql
query ActiveShiftsDetail {
  shifts(active: true, limit: 50) {
    shifts {
      id
      startDate
      startTime
      endTime
      user {
        name
        lastName
        username
      }
      observations
    }
    total
  }
}
```

### 2. View My Shifts (Current User)

```graphql
query MyShifts {
  userShifts {
    id
    startDate
    endDate
    startTime
    endTime
    active
    observations
  }
}
```

### 3. Close a Shift

```graphql
mutation CloseSpecificShift {
  closeShift(id: "shift_id_here") {
    id
    endDate
    active
    updatedAt
  }
}
```

### 4. Update Shift Schedule

```graphql
mutation ExtendShift {
  updateShift(
    id: "shift_id_here"
    updateShiftInput: {
      endTime: "18:00"
      observations: "Shift extended due to high demand"
    }
  ) {
    id
    endTime
    observations
    updatedAt
  }
}
```

## Complete Daily Workflow

### Step 1: Create Day's Shifts
```graphql
mutation DailyShifts {
  # Shift 1
  shift1: createShift(createShiftInput: {
    startDate: "2024-01-16T08:00:00Z"
    startTime: "08:00"
    endTime: "16:00"
    userId: "employee1_id"
    observations: "Day shift - Juan"
  }) { id }
  
  # Shift 2
  shift2: createShift(createShiftInput: {
    startDate: "2024-01-16T16:00:00Z"
    startTime: "16:00"
    endTime: "23:59"
    userId: "employee2_id"
    observations: "Night shift - María"
  }) { id }
}
```

### Step 2: Process Closures
```graphql
# Closure for shift 1
mutation ClosureShift1 {
  procesarCierreTurno(cierreTurnoInput: {
    turnoId: "SHIFT_1_ID"
    lecturasSurtidores: [
      {
        numeroSurtidor: "PUMP-01"
        mangueras: [
          {
            numeroManguera: "M1"
            codigoProducto: "GASOL-95"
            lecturaAnterior: 1000.0
            lecturaActual: 1150.0
            unidadMedida: "galones"
          }
        ]
      }
    ]
  }) {
    estado
    totalGeneralLitros
    valorTotalGeneral
  }
}
```

### Step 3: View Daily Reports
```graphql
query DailyReport {
  # View all day's closures
  cierresTurnoPorFecha(fecha: "2024-01-16") {
    id
    fechaCierre
    estado
    totalVentasLitros
    valorTotalGeneral
    turnoId
  }
  
  # View day's shifts
  shifts(
    startDate: "2024-01-16T00:00:00Z"
    endDate: "2024-01-16T23:59:59Z"
  ) {
    shifts {
      id
      startTime
      endTime
      active
      user {
        name
        lastName
      }
    }
  }
}
```

## Common Error Cases

### 1. User Doesn't Exist
```graphql
mutation InvalidUserShift {
  createShift(createShiftInput: {
    startDate: "2024-01-15T08:00:00Z"
    startTime: "08:00"
    userId: "nonexistent_user"
  }) {
    id
  }
}
# Error: "User not found"
```

### 2. Invalid Time Format
```graphql
mutation InvalidTimeShift {
  createShift(createShiftInput: {
    startDate: "2024-01-15T08:00:00Z"
    startTime: "25:00"  # ❌ Invalid time
    userId: "valid_user_id"
  }) {
    id
  }
}
# Error: "startTime must have HH:mm format"
```

### 3. Overlapping Shift
```graphql
# If an active shift already exists for the user...
mutation OverlappingShift {
  createShift(createShiftInput: {
    startDate: "2024-01-15T10:00:00Z"
    startTime: "10:00"
    userId: "user_with_active_shift"
  }) {
    id
  }
}
# Error: "User already has an active shift in that period"
```

## Legacy Compatibility Examples

### Using Spanish Names (Still Works)

```graphql
# Create shift with Spanish field names
mutation CrearTurnoLegacy {
  createTurno(createTurnoInput: {
    fechaInicio: "2024-01-15T08:00:00Z"
    horaInicio: "08:00"
    horaFin: "16:00"
    usuarioId: "user_id"
    observaciones: "Turno de prueba"
  }) {
    id
    startDate    # Response uses English names
    startTime
    endTime
    active
  }
}

# Query shifts with Spanish names
query TurnosLegacy {
  turnos(usuarioId: "user_id", limit: 10) {
    turnos {
      id
      fechaInicio    # Can use Spanish in query
      horaInicio
      activo
      # But response will have English field names:
      # startDate, startTime, active
    }
  }
}
```

## Tips and Best Practices

### ✅ **Recommended**
- Use ISO date format: `"2024-01-15T08:00:00Z"`
- 24-hour time format: `"08:00"`, `"14:30"`
- Close shifts when finished: `closeShift()`
- Use descriptive observations
- Use English field names for new development

### ❌ **Avoid**
- Local date formats: `"15/01/2024"`
- AM/PM time formats: `"8:00 AM"`
- Leaving shifts open indefinitely
- Creating overlapping shifts for the same user

### 🔄 **Migration Guide**
- **Old**: `createTurno` → **New**: `createShift`
- **Old**: `fechaInicio` → **New**: `startDate`
- **Old**: `horaInicio` → **New**: `startTime`
- **Old**: `usuarioId` → **New**: `userId`
- **Old**: `observaciones` → **New**: `observations`
- **Old**: `activo` → **New**: `active` 