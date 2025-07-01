-- CreateTable
CREATE TABLE "inventario"."historial_lecturas" (
    "id" TEXT NOT NULL,
    "fechaLectura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lecturaAnterior" DECIMAL(12,3) NOT NULL,
    "lecturaActual" DECIMAL(12,3) NOT NULL,
    "cantidadVendida" DECIMAL(12,3) NOT NULL,
    "valorVenta" DECIMAL(12,2) NOT NULL,
    "tipoOperacion" TEXT NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mangueraId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "turnoId" TEXT,
    "cierreTurnoId" TEXT,

    CONSTRAINT "historial_lecturas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "inventario"."historial_lecturas" ADD CONSTRAINT "historial_lecturas_mangueraId_fkey" FOREIGN KEY ("mangueraId") REFERENCES "inventario"."mangueras_surtidor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."historial_lecturas" ADD CONSTRAINT "historial_lecturas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."historial_lecturas" ADD CONSTRAINT "historial_lecturas_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"."turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."historial_lecturas" ADD CONSTRAINT "historial_lecturas_cierreTurnoId_fkey" FOREIGN KEY ("cierreTurnoId") REFERENCES "turnos"."cierres_turno"("id") ON DELETE SET NULL ON UPDATE CASCADE;
