-- Crear esquemas en la base de datos
CREATE SCHEMA IF NOT EXISTS usuarios;
CREATE SCHEMA IF NOT EXISTS inventario;
CREATE SCHEMA IF NOT EXISTS ventas;
CREATE SCHEMA IF NOT EXISTS reportes;
CREATE SCHEMA IF NOT EXISTS clientes;
CREATE SCHEMA IF NOT EXISTS turnos;

-- Otorgar permisos al usuario postgres
GRANT ALL PRIVILEGES ON SCHEMA usuarios TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA inventario TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA ventas TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA reportes TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA clientes TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA turnos TO postgres; 