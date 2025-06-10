-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "clientes";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventario";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "reportes";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "turnos";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "usuarios";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ventas";

-- CreateTable
CREATE TABLE "usuarios"."roles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "permisos" TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios"."usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "ultimoLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rolId" TEXT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos"."turnos" (
    "id" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos"."cierres_turno" (
    "id" TEXT NOT NULL,
    "fechaCierre" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalVentasLitros" DECIMAL(12,2) NOT NULL,
    "totalVentasGalones" DECIMAL(12,2) NOT NULL,
    "valorTotalGeneral" DECIMAL(12,2) NOT NULL,
    "productosActualizados" INTEGER NOT NULL DEFAULT 0,
    "tanquesActualizados" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL,
    "errores" TEXT[],
    "advertencias" TEXT[],
    "resumenSurtidores" JSONB NOT NULL,
    "observacionesGenerales" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "turnoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "cierres_turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes"."clientes" (
    "id" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT,
    "razonSocial" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."categorias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."productos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidadMedida" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "esCombustible" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoriaId" TEXT NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."tanques" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "capacidadTotal" DECIMAL(10,2) NOT NULL,
    "nivelActual" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "nivelMinimo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productoId" TEXT NOT NULL,

    CONSTRAINT "tanques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."surtidores" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "ubicacion" TEXT,
    "cantidadMangueras" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaInstalacion" TIMESTAMP(3),
    "fechaMantenimiento" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surtidores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."mangueras_surtidor" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "color" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "surtidorId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,

    CONSTRAINT "mangueras_surtidor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."entradas_inventario" (
    "id" TEXT NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "precioTotal" DECIMAL(10,2) NOT NULL,
    "numeroFactura" TEXT,
    "observaciones" TEXT,
    "fechaEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productoId" TEXT NOT NULL,
    "tanqueId" TEXT,

    CONSTRAINT "entradas_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas"."ventas" (
    "id" TEXT NOT NULL,
    "numeroVenta" TEXT NOT NULL,
    "fechaVenta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "impuestos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "descuentos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'completada',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas"."detalles_ventas" (
    "id" TEXT NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ventaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,

    CONSTRAINT "detalles_ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes"."ventas_diarias" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "totalVentas" INTEGER NOT NULL,
    "montoTotal" DECIMAL(12,2) NOT NULL,
    "totalCombustible" DECIMAL(12,2) NOT NULL,
    "totalProductos" DECIMAL(12,2) NOT NULL,
    "ventasEfectivo" DECIMAL(12,2) NOT NULL,
    "ventasTarjeta" DECIMAL(12,2) NOT NULL,
    "ventasTransferencia" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventas_diarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes"."inventario_actual" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "stockActual" INTEGER NOT NULL,
    "valorInventario" DECIMAL(12,2) NOT NULL,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventario_actual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "usuarios"."roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"."usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_numeroDocumento_key" ON "clientes"."clientes"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"."clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "inventario"."categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_key" ON "inventario"."productos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tanques_numero_key" ON "inventario"."tanques"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "surtidores_numero_key" ON "inventario"."surtidores"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "mangueras_surtidor_surtidorId_numero_key" ON "inventario"."mangueras_surtidor"("surtidorId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_numeroVenta_key" ON "ventas"."ventas"("numeroVenta");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_diarias_fecha_key" ON "reportes"."ventas_diarias"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_actual_productoId_key" ON "reportes"."inventario_actual"("productoId");

-- AddForeignKey
ALTER TABLE "usuarios"."usuarios" ADD CONSTRAINT "usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "usuarios"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos"."turnos" ADD CONSTRAINT "turnos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos"."cierres_turno" ADD CONSTRAINT "cierres_turno_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"."turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos"."cierres_turno" ADD CONSTRAINT "cierres_turno_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "inventario"."categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."tanques" ADD CONSTRAINT "tanques_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "inventario"."productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."mangueras_surtidor" ADD CONSTRAINT "mangueras_surtidor_surtidorId_fkey" FOREIGN KEY ("surtidorId") REFERENCES "inventario"."surtidores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."mangueras_surtidor" ADD CONSTRAINT "mangueras_surtidor_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "inventario"."productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."entradas_inventario" ADD CONSTRAINT "entradas_inventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "inventario"."productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."entradas_inventario" ADD CONSTRAINT "entradas_inventario_tanqueId_fkey" FOREIGN KEY ("tanqueId") REFERENCES "inventario"."tanques"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas"."ventas" ADD CONSTRAINT "ventas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"."clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas"."ventas" ADD CONSTRAINT "ventas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas"."ventas" ADD CONSTRAINT "ventas_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"."turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas"."detalles_ventas" ADD CONSTRAINT "detalles_ventas_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"."ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas"."detalles_ventas" ADD CONSTRAINT "detalles_ventas_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "inventario"."productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
