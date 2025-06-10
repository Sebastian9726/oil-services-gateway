# Shift Management

## Summary

Complete system to create, modify and manage work shifts with specific schedules and assigned users.

## Implemented Features

### ✅ **Complete CRUD**
- **Create shifts** with schedule validations
- **Query shifts** with advanced filters
- **Update shifts** partially or completely
- **Delete shifts** with protections
- **Close shifts** automatically

### ✅ **Validations**
- **Time format**: HH:mm (e.g.: 08:00, 14:30)
- **Valid users**: Existence verification
- **Overlapping shifts**: Conflict prevention
- **Valid dates**: ISO format

### ✅ **Advanced Queries**
- Filters by user, date, status
- Pagination
- Active shifts
- User history

## Available Operations

### 1. Create Shift

```graphql
mutation CreateShift {
  createShift(createShiftInput: {
    startDate: "2024-01-15T08:00:00Z"
    startTime: "08:00"
    endTime: "16:00"
    userId: "user_id_here"
    observations: "Morning shift"
  }) {
    id
    startDate
    startTime
    endTime
    observations
    active
    user {
      name
      lastName
      username
    }
  }
}
```

### 2. Query Shifts with Filters

```graphql
query QueryShifts {
  shifts(
    userId: "user_id_here"
    startDate: "2024-01-01T00:00:00Z"
    endDate: "2024-01-31T23:59:59Z"
    active: true
    page: 1
    limit: 10
  ) {
    shifts {
      id
      startDate
      endDate
      startTime
      endTime
      observations
      active
      user {
        name
        lastName
        username
      }
    }
    total
    page
    limit
  }
}
```

### 3. Query Specific Shift

```graphql
query QueryShift($id: ID!) {
  shift(id: $id) {
    id
    startDate
    endDate
    startTime
    endTime
    observations
    active
    createdAt
    updatedAt
    user {
      id
      name
      lastName
      username
      email
    }
  }
}
```

### 4. Update Shift

```graphql
mutation UpdateShift {
  updateShift(
    id: "shift_id_here"
    updateShiftInput: {
      endTime: "17:00"
      observations: "Extended shift"
    }
  ) {
    id
    endTime
    observations
    updatedAt
  }
}
```

### 5. Close Shift

```graphql
mutation CloseShift {
  closeShift(id: "shift_id_here") {
    id
    endDate
    active
    updatedAt
  }
}
```

### 6. Shifts by User

```graphql
query UserShifts {
  userShifts(userId: "user_id_here") {
    id
    startDate
    endDate
    startTime
    endTime
    active
    observations
  }
}

# Or current user's shifts (authenticated)
query MyShifts {
  userShifts {
    id
    startDate
    endDate
    startTime
    endTime
    active
  }
}
```

### 7. Active Shifts

```graphql
query ActiveShifts {
  activeShifts
}

# Returns JSON string with:
# {
#   "activeShifts": 3,
#   "shifts": [...]
# }
```

## Implemented Validations

### **Time Format**
```
✅ Valid: "08:00", "14:30", "23:59"
❌ Invalid: "8:00", "25:00", "14:60"
```

### **Dates**
```
✅ Valid: "2024-01-15T08:00:00Z", "2024-12-31T23:59:59Z"
❌ Invalid: "2024/01/15", "invalid-date"
```

### **Conflict Prevention**
- Cannot create overlapping shifts for the same user
- Active shifts without end date block new shifts

## Permissions by Role

| Operation | Admin | Manager | Employee |
|-----------|-------|---------|----------|
| Create shift | ✅ | ✅ | ❌ |
| View shifts | ✅ | ✅ | ✅ |
| View specific shift | ✅ | ✅ | ✅ |
| Update shift | ✅ | ✅ | ❌ |
| Close shift | ✅ | ✅ | ❌ |
| Delete shift | ✅ | ❌ | ❌ |
| View active shifts | ✅ | ✅ | ✅ |
| View own shifts | ✅ | ✅ | ✅ |

## Practical Use Cases

### **Create Test Shift**
```graphql
mutation CreateTestShift {
  createShift(createShiftInput: {
    startDate: "2024-01-15T08:00:00Z"
    startTime: "08:00"
    endTime: "16:00"
    userId: "clrn4ohvh0002yqpjgz1mj7h6"  # Admin ID
    observations: "Test shift for closure testing"
  }) {
    id
    startDate
    startTime
    endTime
    active
  }
}
```

### **Schedule Weekly Shifts**
```graphql
# Monday Shift
mutation MondayShift {
  createShift(createShiftInput: {
    startDate: "2024-01-15T08:00:00Z"
    startTime: "08:00"
    endTime: "16:00"
    userId: "user1_id"
    observations: "Morning shift - Monday"
  }) { id }
}

# Tuesday Shift
mutation TuesdayShift {
  createShift(createShiftInput: {
    startDate: "2024-01-16T16:00:00Z"
    startTime: "16:00"
    endTime: "23:59"
    userId: "user2_id"
    observations: "Evening shift - Tuesday"
  }) { id }
}
```

### **Query Monthly Shifts**
```graphql
query JanuaryShifts {
  shifts(
    startDate: "2024-01-01T00:00:00Z"
    endDate: "2024-01-31T23:59:59Z"
    limit: 50
  ) {
    shifts {
      id
      startDate
      startTime
      endTime
      user {
        name
        lastName
      }
    }
    total
  }
}
```

## Integration with Shift Closures

Once you have created shifts, you can use them in closures:

```graphql
mutation ProcessClosureWithRealShift {
  procesarCierreTurno(cierreTurnoInput: {
    turnoId: "real_shift_id_here"  # Use created shift ID
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
    valorTotalGeneral
    turnoId
  }
}
```

## Shift States

### **Active** (`active: true`)
- Shift in progress or scheduled
- Can receive shift closures
- No end date

### **Closed** (`active: false`)
- Completed shift
- Has defined end date
- Cannot receive new closures

## Legacy Compatibility

The system maintains compatibility with Spanish names for existing integrations:

```graphql
# Spanish names still work
query TurnosLegacy {
  turnos(usuarioId: "user_id", limit: 10) {
    turnos {
      id
      fechaInicio
      horaInicio
      # Returns English field names in response
    }
  }
}

mutation CrearTurnoLegacy {
  createTurno(createTurnoInput: {
    fechaInicio: "2024-01-15T08:00:00Z"
    horaInicio: "08:00"
    usuarioId: "user_id"
  }) {
    id
    startDate  # Response uses English names
    startTime
  }
}
```

## Future Improvements

- 🔄 **Recurring shifts**: Automatic weekly/monthly scheduling
- 📊 **Shift reports**: Statistics and analysis
- ⏰ **Reminders**: Start/end shift notifications
- 🔄 **Handovers**: Shift change management between users 