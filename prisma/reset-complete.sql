-- Borrar TODAS las tablas de TODOS los schemas
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Borrar todas las tablas de todos los schemas
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname IN ('usuarios', 'inventario', 'ventas', 'reportes', 'clientes', 'turnos', 'configuracion', 'public')) 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Borrar todas las secuencias
    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname IN ('usuarios', 'inventario', 'ventas', 'reportes', 'clientes', 'turnos', 'configuracion', 'public'))
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
    END LOOP;
END $$;

-- Borrar y recrear todos los schemas
DROP SCHEMA IF EXISTS "usuarios" CASCADE;
DROP SCHEMA IF EXISTS "inventario" CASCADE;
DROP SCHEMA IF EXISTS "ventas" CASCADE;
DROP SCHEMA IF EXISTS "reportes" CASCADE;
DROP SCHEMA IF EXISTS "clientes" CASCADE;
DROP SCHEMA IF EXISTS "turnos" CASCADE;
DROP SCHEMA IF EXISTS "configuracion" CASCADE;

-- Recrear los schemas
CREATE SCHEMA "usuarios";
CREATE SCHEMA "inventario";
CREATE SCHEMA "ventas";
CREATE SCHEMA "reportes";
CREATE SCHEMA "clientes";
CREATE SCHEMA "turnos";
CREATE SCHEMA "configuracion"; 