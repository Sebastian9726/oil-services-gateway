# 🚗 Oil Services Gateway

MVP completo para gestión de estación de servicios desarrollado con NestJS, GraphQL y Prisma ORM.

## 🚀 Características

### Arquitectura
- **Backend**: NestJS con TypeScript
- **API**: GraphQL con Apollo Server (code-first approach)
- **Base de datos**: PostgreSQL con múltiples esquemas
- **ORM**: Prisma con soporte multi-esquema
- **Autenticación**: JWT con Passport.js
- **Validación**: class-validator
- **Contenedores**: Docker y Docker Compose

### Módulos Principales
- **👥 Usuarios y Autenticación**: Gestión de usuarios, roles y autenticación JWT
- **📦 Inventario**: CRUD de productos, categorías, tanques y entradas de inventario
- **💰 Ventas**: Registro de ventas, detalles y gestión de transacciones
- **👤 Clientes**: Registro y gestión de clientes
- **⏰ Turnos**: Control de turnos laborales de empleados
- **📊 Reportes**: Reportes de ventas diarias e inventario actual

### Base de Datos
La base de datos está organizada en 6 esquemas normalizados:
- `usuarios`: Gestión de usuarios y roles
- `inventario`: Productos, categorías, tanques y entradas
- `ventas`: Transacciones y detalles de ventas
- `clientes`: Información de clientes
- `turnos`: Gestión de turnos laborales
- `reportes`: Vistas y reportes agregados

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn
- Docker y Docker Compose
- Git

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd oil-services-gateway
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/estacion_servicio_db?schema=public"

# JWT Configuration
JWT_SECRET="tu-jwt-secret-super-seguro-aqui-cambiar-en-produccion"
JWT_EXPIRES_IN="1d"

# Puerto de la aplicación
PORT=3000

# Configuración del entorno
NODE_ENV="development"

# GraphQL Playground (solo para desarrollo)
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
```

### 4. Levantar la base de datos con Docker
```bash
# Iniciar PostgreSQL y PgAdmin
npm run docker:up

# Verificar que los contenedores estén ejecutándose
docker ps
```

### 5. Ejecutar migraciones de Prisma
```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar la base de datos con datos iniciales
npm run prisma:seed
```

### 6. Iniciar la aplicación
```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

## 🔧 Scripts Disponibles

### Desarrollo
```bash
npm run start:dev          # Iniciar en modo desarrollo con watch
npm run start:debug        # Iniciar en modo debug
npm run build              # Compilar la aplicación
npm run start:prod         # Iniciar en modo producción
```

### Base de Datos
```bash
npm run prisma:generate    # Generar cliente de Prisma
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:reset       # Resetear base de datos
npm run prisma:seed        # Poblar con datos iniciales
npm run prisma:studio      # Abrir Prisma Studio
```

### Docker
```bash
npm run docker:up          # Iniciar contenedores
npm run docker:down        # Detener contenedores
npm run docker:logs        # Ver logs de contenedores
```

### Testing y Calidad
```bash
npm run test               # Ejecutar tests
npm run test:watch         # Tests en modo watch
npm run test:cov           # Tests con cobertura
npm run lint               # Linter
npm run format             # Formatear código
```

## 🌐 Accesos

### Aplicación
- **GraphQL Playground**: http://localhost:3000/graphql
- **API GraphQL**: http://localhost:3000/graphql

### Base de Datos
- **PostgreSQL**: localhost:5432
- **PgAdmin**: http://localhost:5050
  - Usuario: admin@estacion.com
  - Contraseña: admin123

### Usuario Administrador por Defecto
- **Email**: admin@estacion.com
- **Contraseña**: admin123

## 📋 Ejemplos de Uso con GraphQL

### Autenticación
```graphql
# Login
mutation {
  login(loginInput: {
    email: "admin@estacion.com"
    password: "admin123"
  }) {
    access_token
    user {
      id
      email
      nombre
      apellido
      rol {
        nombre
        permisos
      }
    }
    tokenType
    expiresIn
  }
}
```

### Gestión de Usuarios
```graphql
# Listar usuarios
query {
  users {
    id
    email
    username
    nombre
    apellido
    activo
    rol {
      nombre
    }
  }
}

# Crear usuario
mutation {
  createUser(createUserInput: {
    email: "empleado@estacion.com"
    username: "empleado1"
    password: "123456"
    nombre: "Carlos"
    apellido: "García"
    telefono: "987654321"
    rolId: "rol-id-empleado"
  }) {
    id
    email
    nombre
  }
}
```

### Gestión de Productos
```graphql
# Listar productos
query {
  products {
    id
    codigo
    nombre
    precio
    stockActual
    stockMinimo
    categoria {
      nombre
    }
  }
}

# Crear producto
mutation {
  createProduct(createProductInput: {
    codigo: "PROD-001"
    nombre: "Producto Ejemplo"
    descripcion: "Descripción del producto"
    unidadMedida: "unidades"
    precio: 10.50
    stockMinimo: 5
    stockActual: 100
    esCombustible: false
    categoriaId: "categoria-id"
  }) {
    id
    codigo
    nombre
  }
}
```

### Gestión de Ventas
```graphql
# Crear venta
mutation {
  createSale(createSaleInput: {
    clienteId: "cliente-id"
    metodoPago: "efectivo"
    detalles: [
      {
        productoId: "producto-id"
        cantidad: 2
        precioUnitario: 10.50
      }
    ]
  }) {
    id
    numeroVenta
    total
    fechaVenta
  }
}
```

## 🏗️ Estructura del Proyecto

```
oil-services-gateway/
├── prisma/
│   ├── schema.prisma      # Esquema de Prisma
│   ├── seed.ts           # Datos iniciales
│   └── init.sql          # Inicialización de esquemas
├── src/
│   ├── common/           # Utilidades compartidas
│   ├── config/           # Configuraciones
│   │   └── prisma/       # Configuración de Prisma
│   └── modules/          # Módulos de la aplicación
│       ├── auth/         # Autenticación
│       ├── users/        # Usuarios y roles
│       ├── inventory/    # Inventario
│       ├── sales/        # Ventas
│       ├── clients/      # Clientes
│       ├── shifts/       # Turnos
│       └── reports/      # Reportes
├── docker-compose.yml    # Configuración de Docker
├── package.json
└── README.md
```

## 🔐 Sistema de Roles y Permisos

### Roles Predefinidos
- **Admin**: Acceso completo al sistema
- **Gerente**: Gestión operativa y reportes
- **Empleado**: Acceso básico a ventas

### Permisos por Módulo
Los permisos siguen el patrón: `modulo:accion`
- `users:create`, `users:read`, `users:update`, `users:delete`
- `inventory:create`, `inventory:read`, `inventory:update`, `inventory:delete`
- `sales:create`, `sales:read`, `sales:update`, `sales:delete`
- `reports:read`
- `clients:create`, `clients:read`, `clients:update`, `clients:delete`
- `shifts:create`, `shifts:read`, `shifts:update`, `shifts:delete`

## 📊 Base de Datos

### Normalización
La base de datos sigue las reglas de normalización 1FN, 2FN y 3FN:
- **1FN**: Todos los valores son atómicos
- **2FN**: No hay dependencias parciales de claves primarias
- **3FN**: No hay dependencias transitivas

### Esquemas
- **usuarios**: Gestión de autenticación y autorización
- **inventario**: Catálogo de productos y control de stock
- **ventas**: Transacciones comerciales
- **clientes**: Información de clientes
- **turnos**: Control laboral
- **reportes**: Datos agregados para análisis

## 🚀 Despliegue

### Variables de Entorno para Producción
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-key
GRAPHQL_PLAYGROUND=false
GRAPHQL_INTROSPECTION=false
```

### Docker Compose para Producción
Descomenta la sección `app` en `docker-compose.yml` y crea un `Dockerfile.dev`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas Importantes

- **Seguridad**: Cambia las contraseñas por defecto en producción
- **JWT Secret**: Usa un secreto seguro y único para JWT
- **Base de Datos**: Configura backups regulares
- **Logs**: Implementa logging apropiado para producción
- **Monitoreo**: Considera implementar herramientas de monitoreo

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto, contacta al equipo de desarrollo.

---

**Oil Services Gateway** - MVP para gestión integral de estaciones de servicios
Desarrollado con ❤️ usando NestJS, GraphQL y Prisma

# Oil Services Gateway - Gestión de Estaciones de Servicio

## Mutation: processShiftClosure

El mutation `processShiftClosure` ahora incluye la capacidad de registrar la cantidad total de ventas realizadas durante el turno.

### Ejemplo de uso con estadísticas de ventas:

```graphql
mutation ProcessShiftClosure {
  processShiftClosure(cierreTurnoInput: {
    lecturasSurtidores: [
      {
        numeroSurtidor: "S-003"
        mangueras: [
          {
            numeroManguera: "5"
            codigoProducto: "GASOL-95"
            lecturaAnterior: 34773
            lecturaActual: 34774
            unidadMedida: "galones"
          }
          {
            numeroManguera: "6"
            codigoProducto: "DIESEL"
            lecturaAnterior: 40300
            lecturaActual: 40303
            unidadMedida: "galones"
          }
        ]
      }
    ]
    
    # Lecturas de tanques
    lecturasTanques: [
      {
        tanqueId: "cme9dgkno000xuhbvvec6vgbz"
        nombreTanque: "T-001"
        alturaFluido: 120
      }
    ]
    
    # Ventas de productos de tienda
    ventasProductos: [
      {
        codigoProducto: "COCA-350"
        cantidad: 5
        unidadMedida: "unidades"
        precioUnitario: 2500
        valorTotal: 12500
        observaciones: "Coca Cola 350ml"
      }
    ]
    
    # *** NUEVO CAMPO: Cantidad total de ventas realizadas ***
    cantidadVentasRealizadas: 30
    
    observacionesGenerales: "Cierre de turno con 30 ventas totales"
    puntoVentaId: "cme9dgjvn0002uhbvd3l50c0e"
    startTime: "2025-08-13 20:51:00.000"
    finishTime: "2025-08-13 22:51:00.000"
    
    resumenVentas: {
      totalVentasTurno: 15
      metodosPago: [
        {
          metodoPago: "EFECTIVO"
          monto: 225700
          observaciones: "Efectivo - $ 225.700,00"
        }
      ]
      observaciones: "Cierre de turno con 30 ventas totales"
    }
  }) {
    # Campos básicos
    totalGeneralLitros
    totalGeneralGalones
    valorTotalGeneral
    fechaProceso
    turnoId
    productosActualizados
    estado
    errores
    advertencias
    
    # *** NUEVOS CAMPOS: Estadísticas de ventas ***
    cantidadVentasDeclaradas
    cantidadVentasCalculadas
    
    estadisticasVentas {
      cantidadVentasDeclaradas
      cantidadVentasCalculadas
      ventasCombustibles
      ventasProductos
      promedioVentaPorTransaccion
      observaciones
    }
    
    # Otros campos existentes
    resumenSurtidores {
      numeroSurtidor
      totalVentasLitros
      totalVentasGalones
      valorTotalSurtidor
      observaciones
      ventas {
        codigoProducto
        nombreProducto
        cantidadVendidaGalones
        cantidadVendidaLitros
        valorTotalVenta
      }
    }
    
    resumenFinanciero {
      totalDeclarado
      totalCalculado
      diferencia
      metodosPago {
        metodoPago
        monto
        porcentaje
        observaciones
      }
    }
  }
}
```

### Explicación de las nuevas funcionalidades:

1. **`cantidadVentasRealizadas`** (Input): Campo opcional donde puedes indicar cuántas ventas se realizaron según tus registros (ejemplo: 30 ventas).

2. **`cantidadVentasDeclaradas`** (Output): Retorna el valor que enviaste en `cantidadVentasRealizadas`.

3. **`cantidadVentasCalculadas`** (Output): Número de ventas calculadas automáticamente basado en:
   - Ventas de combustibles (una por cada manguera con venta > 0)
   - Ventas de productos de tienda

4. **`estadisticasVentas`** (Output): Objeto completo con estadísticas detalladas:
   - `cantidadVentasDeclaradas`: Lo que declaraste
   - `cantidadVentasCalculadas`: Lo que el sistema calculó
   - `ventasCombustibles`: Número de ventas de combustible
   - `ventasProductos`: Número de ventas de productos de tienda
   - `promedioVentaPorTransaccion`: Valor promedio por venta
   - `observaciones`: Indica si hay diferencias entre declarado vs calculado

### Utilidad:

- **Control de calidad**: Compara las ventas que declares vs las que el sistema calcula
- **Detección de errores**: Si hay diferencias, el sistema te alertará
- **Estadísticas**: Obtén métricas detalladas sobre el desempeño del turno
- **Auditoría**: Toda la información se guarda para consultas posteriores

Si declares 30 ventas pero el sistema solo detecta 25 (por ejemplo, 20 de combustible + 5 de productos), recibirás una advertencia sobre la diferencia.

---

## Mutation: processShiftClosure con Métodos de Pago por Producto

El mutation `processShiftClosure` ahora soporta métodos de pago específicos para cada producto, permitiendo un control detallado de cómo se pagó cada venta.

### Ejemplo de uso con métodos de pago por producto:

```graphql
mutation ProcessShiftClosure {
  processShiftClosure(cierreTurnoInput: {
    lecturasSurtidores: [
      {
        numeroSurtidor: "S-003"
        mangueras: [
          {
            numeroManguera: "5"
            codigoProducto: "GASOL-95"
            lecturaAnterior: 34773
            lecturaActual: 34774
            unidadMedida: "galones"
            # *** NUEVO: Métodos de pago específicos para gasolina ***
            metodosPago: [
              {
                metodoPago: "EFECTIVO"
                monto: 100000
                observaciones: "Pago en efectivo"
              }
              {
                metodoPago: "RUMBO"
                monto: 200000
                observaciones: "Pago con tarjeta Rumbo"
              }
            ]
          }
          {
            numeroManguera: "6"
            codigoProducto: "DIESEL"
            lecturaAnterior: 40300
            lecturaActual: 40303
            unidadMedida: "galones"
            # *** NUEVO: Métodos de pago específicos para diesel ***
            metodosPago: [
              {
                metodoPago: "EFECTIVO"
                monto: 150000
                observaciones: "Todo en efectivo"
              }
            ]
          }
        ]
      }
    ]
    
    # Ventas de productos de tienda con métodos de pago específicos
    ventasProductos: [
      {
        codigoProducto: "COCA-350"
        cantidad: 5
        unidadMedida: "unidades"
        precioUnitario: 2500
        valorTotal: 12500
        # *** NUEVO: Métodos de pago específicos para productos de tienda ***
        metodosPago: [
          {
            metodoPago: "EFECTIVO"
            monto: 7500
          }
          {
            metodoPago: "TARJETA_CREDITO"
            monto: 5000
          }
        ]
        observaciones: "Coca Cola 350ml"
      }
      {
        codigoProducto: "ACEITE-20W50"
        cantidad: 2
        unidadMedida: "galones"
        precioUnitario: 45000
        valorTotal: 90000
        metodosPago: [
          {
            metodoPago: "TRANSFERENCIA"
            monto: 90000
            observaciones: "Pago por transferencia bancaria"
          }
        ]
      }
    ]
    
    cantidadVentasRealizadas: 30
    observacionesGenerales: "Cierre con métodos de pago detallados por producto"
    puntoVentaId: "cme9dgjvn0002uhbvd3l50c0e"
    startTime: "2025-08-13 20:51:00.000"
    finishTime: "2025-08-13 22:51:00.000"
    
    # Resumen general (mantiene compatibilidad)
    resumenVentas: {
      totalVentasTurno: 552500  # Total general
      metodosPago: [
        {
          metodoPago: "EFECTIVO"
          monto: 257500  # Suma de todos los efectivos
        }
        {
          metodoPago: "RUMBO"
          monto: 200000
        }
        {
          metodoPago: "TARJETA_CREDITO"
          monto: 5000
        }
        {
          metodoPago: "TRANSFERENCIA"
          monto: 90000
        }
      ]
    }
  }) {
    # Respuesta con métodos de pago detallados
    resumenSurtidores {
      numeroSurtidor
      totalVentasLitros
      totalVentasGalones
      valorTotalSurtidor
      ventas {
        codigoProducto
        nombreProducto
        cantidadVendidaGalones
        cantidadVendidaLitros
        valorTotalVenta
        # *** NUEVO: Métodos de pago por producto en la respuesta ***
        metodosPago {
          metodoPago
          monto
          porcentaje
          observaciones
        }
      }
    }
    
    resumenVentasProductos {
      totalProductosVendidos
      valorTotalVentasProductos
      ventasDetalle {
        codigoProducto
        nombreProducto
        cantidadVendida
        valorTotalVenta
        # *** NUEVO: Métodos de pago por producto de tienda ***
        metodosPago {
          metodoPago
          monto
          porcentaje
          observaciones
        }
        procesadoExitosamente
      }
    }
    
    # Otros campos...
    estadisticasVentas {
      cantidadVentasDeclaradas
      cantidadVentasCalculadas
      ventasCombustibles
      ventasProductos
      promedioVentaPorTransaccion
    }
  }
}
```

### Características de los métodos de pago por producto:

1. **Granularidad**: Cada producto puede tener sus propios métodos de pago
2. **Validación automática**: El sistema verifica que la suma de métodos de pago coincida con el valor del producto
3. **Porcentajes calculados**: Se calcula automáticamente el porcentaje de cada método de pago por producto
4. **Compatibilidad**: Mantiene el resumen general para compatibilidad con versiones anteriores
5. **Advertencias**: Si hay discrepancias, se generan advertencias automáticas

### Ejemplo de respuesta:

```json
{
  "resumenSurtidores": [
    {
      "numeroSurtidor": "S-003",
      "ventas": [
        {
          "codigoProducto": "GASOL-95",
          "nombreProducto": "Gasolina 95 Octanos",
          "valorTotalVenta": 300000,
          "metodosPago": [
            {
              "metodoPago": "EFECTIVO",
              "monto": 100000,
              "porcentaje": 33.33
            },
            {
              "metodoPago": "RUMBO",
              "monto": 200000,
              "porcentaje": 66.67
            }
          ]
        }
      ]
    }
  ],
  "resumenVentasProductos": {
    "ventasDetalle": [
      {
        "codigoProducto": "COCA-350",
        "nombreProducto": "Coca Cola 350ml",
        "valorTotalVenta": 12500,
        "metodosPago": [
          {
            "metodoPago": "EFECTIVO",
            "monto": 7500,
            "porcentaje": 60.0
          },
          {
            "metodoPago": "TARJETA_CREDITO",
            "monto": 5000,
            "porcentaje": 40.0
          }
        ]
      }
    ]
  }
}
```

### Casos de uso:

- **Estación con múltiples formas de pago**: Registrar exactamente cómo se pagó cada producto
- **Control de caja por producto**: Saber cuánto efectivo corresponde a gasolina vs diesel vs tienda
- **Reportes detallados**: Análisis de preferencias de pago por tipo de producto
- **Auditoría**: Trazabilidad completa de cada transacción

---

## Mutation: processShiftClosure con Ventas Individuales por Unidad

Para productos que se manejan por unidades (como Coca-Cola, aceites, etc.), ahora puedes registrar cada venta individual con su propio método de pago.

### Ejemplo: 2 Coca-Colas vendidas por separado

```graphql
mutation ProcessShiftClosure {
  processShiftClosure(cierreTurnoInput: {
    # ... lecturas de surtidores ...
    
    # Ventas de productos con ventas individuales
    ventasProductos: [
      {
        codigoProducto: "COCA-350"
        unidadMedida: "unidades"
        
        # *** NUEVO: Ventas individuales por unidad ***
        ventasIndividuales: [
          {
            cantidad: 1
            precioUnitario: 4500
            valorTotal: 4500
            metodosPago: [
              {
                metodoPago: "EFECTIVO"
                monto: 4500
                observaciones: "Primera Coca-Cola en efectivo"
              }
            ]
            observaciones: "Venta individual #1"
          }
          {
            cantidad: 1
            precioUnitario: 4500
            valorTotal: 4500
            metodosPago: [
              {
                metodoPago: "TARJETA_CREDITO"
                monto: 4500
                observaciones: "Segunda Coca-Cola con tarjeta"
              }
            ]
            observaciones: "Venta individual #2"
          }
        ]
        
        observaciones: "Total: 2 Coca-Colas con métodos de pago diferentes"
      }
      
      # Ejemplo con múltiples unidades en una sola transacción
      {
        codigoProducto: "ACEITE-20W50"
        unidadMedida: "galones"
        ventasIndividuales: [
          {
            cantidad: 3
            precioUnitario: 45000
            valorTotal: 135000
            metodosPago: [
              {
                metodoPago: "EFECTIVO"
                monto: 50000
              }
              {
                metodoPago: "TARJETA_DEBITO"
                monto: 85000
              }
            ]
            observaciones: "3 galones de aceite pagados mixto"
          }
        ]
      }
      
      # Formato anterior (compatible) - venta consolidada
      {
        codigoProducto: "AGUA-500"
        cantidad: 5
        unidadMedida: "unidades"
        precioUnitario: 2000
        valorTotal: 10000
        metodosPago: [
          {
            metodoPago: "EFECTIVO"
            monto: 10000
          }
        ]
        observaciones: "Formato anterior - todas juntas"
      }
    ]
    
    # ... resto de la configuración ...
  }) {
    resumenVentasProductos {
      totalProductosVendidos
      valorTotalVentasProductos
      ventasDetalle {
        codigoProducto
        nombreProducto
        cantidadVendida  # Total consolidado
        valorTotalVenta  # Total consolidado
        
        # *** NUEVO: Detalle de ventas individuales ***
        ventasIndividuales {
          cantidad
          precioUnitario
          valorTotal
          metodosPago {
            metodoPago
            monto
            porcentaje
            observaciones
          }
          procesadoExitosamente
          observaciones
        }
        
        # Métodos de pago consolidados
        metodosPago {
          metodoPago
          monto
          porcentaje
        }
        
        procesadoExitosamente
      }
    }
  }
}
```

### Respuesta esperada:

```json
{
  "resumenVentasProductos": {
    "totalProductosVendidos": 3,
    "valorTotalVentasProductos": 154500,
    "ventasDetalle": [
      {
        "codigoProducto": "COCA-350",
        "nombreProducto": "Coca Cola 350ml",
        "cantidadVendida": 2,
        "valorTotalVenta": 9000,
        "ventasIndividuales": [
          {
            "cantidad": 1,
            "precioUnitario": 4500,
            "valorTotal": 4500,
            "metodosPago": [
              {
                "metodoPago": "EFECTIVO",
                "monto": 4500,
                "porcentaje": 100.0,
                "observaciones": "Primera Coca-Cola en efectivo"
              }
            ],
            "procesadoExitosamente": true,
            "observaciones": "Venta individual #1"
          },
          {
            "cantidad": 1,
            "precioUnitario": 4500,
            "valorTotal": 4500,
            "metodosPago": [
              {
                "metodoPago": "TARJETA_CREDITO",
                "monto": 4500,
                "porcentaje": 100.0,
                "observaciones": "Segunda Coca-Cola con tarjeta"
              }
            ],
            "procesadoExitosamente": true,
            "observaciones": "Venta individual #2"
          }
        ],
        "metodosPago": [
          {
            "metodoPago": "EFECTIVO",
            "monto": 4500,
            "porcentaje": 50.0
          },
          {
            "metodoPago": "TARJETA_CREDITO",
            "monto": 4500,
            "porcentaje": 50.0
          }
        ],
        "procesadoExitosamente": true
      }
    ]
  }
}
```

### Características del nuevo formato:

1. **Ventas Individuales**: Cada unidad o grupo de unidades puede tener sus propios métodos de pago
2. **Consolidación Automática**: El sistema consolida automáticamente los totales y métodos de pago
3. **Compatibilidad**: Mantiene soporte para el formato anterior
4. **Validación Granular**: Verifica cada venta individual por separado
5. **Trazabilidad Completa**: Cada unidad vendida queda registrada con su método de pago específico

### Casos de uso:

- **Venta mixta de productos idénticos**: 2 Coca-Colas, una en efectivo y otra con tarjeta
- **Compras grupales**: 3 aceites pagados parcialmente en efectivo y parcialmente con tarjeta
- **Control granular**: Saber exactamente cómo se pagó cada unidad individual
- **Reportes detallados**: Análisis de preferencias de pago por unidad de producto

---