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