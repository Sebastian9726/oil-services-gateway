/*
  Warnings:

  - You are about to drop the column `costo` on the `productos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "inventario"."mangueras_surtidor" ADD COLUMN     "lecturaActual" DECIMAL(12,3) NOT NULL DEFAULT 0,
ADD COLUMN     "lecturaAnterior" DECIMAL(12,3) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "inventario"."productos" DROP COLUMN "costo";
