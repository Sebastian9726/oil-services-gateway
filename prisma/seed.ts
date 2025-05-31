import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear roles básicos
  console.log('📝 Creando roles...');
  
  const adminRole = await prisma.rol.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: {
      nombre: 'admin',
      descripcion: 'Administrador del sistema con acceso completo',
      permisos: [
        'users:create',
        'users:read',
        'users:update',
        'users:delete',
        'roles:create',
        'roles:read',
        'roles:update',
        'roles:delete',
        'inventory:create',
        'inventory:read',
        'inventory:update',
        'inventory:delete',
        'sales:create',
        'sales:read',
        'sales:update',
        'sales:delete',
        'reports:read',
        'clients:create',
        'clients:read',
        'clients:update',
        'clients:delete',
        'shifts:create',
        'shifts:read',
        'shifts:update',
        'shifts:delete',
      ],
    },
  });

  const gerenteRole = await prisma.rol.upsert({
    where: { nombre: 'gerente' },
    update: {},
    create: {
      nombre: 'gerente',
      descripcion: 'Gerente con acceso a operaciones y reportes',
      permisos: [
        'users:read',
        'inventory:create',
        'inventory:read',
        'inventory:update',
        'sales:create',
        'sales:read',
        'sales:update',
        'reports:read',
        'clients:create',
        'clients:read',
        'clients:update',
        'shifts:create',
        'shifts:read',
        'shifts:update',
      ],
    },
  });

  const empleadoRole = await prisma.rol.upsert({
    where: { nombre: 'empleado' },
    update: {},
    create: {
      nombre: 'empleado',
      descripcion: 'Empleado con acceso básico a ventas',
      permisos: [
        'inventory:read',
        'sales:create',
        'sales:read',
        'clients:create',
        'clients:read',
        'shifts:read',
      ],
    },
  });

  console.log('✅ Roles creados');

  // Crear usuario administrador
  console.log('👤 Creando usuario administrador...');
  
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@estacion.com' },
    update: {},
    create: {
      email: 'admin@estacion.com',
      username: 'admin',
      password: hashedPassword,
      nombre: 'Administrador',
      apellido: 'Sistema',
      telefono: '123456789',
      emailVerified: true,
      rolId: adminRole.id,
    },
  });

  console.log('✅ Usuario administrador creado');

  // Crear categorías básicas
  console.log('📦 Creando categorías de productos...');
  
  const combustibleCategory = await prisma.categoria.upsert({
    where: { nombre: 'Combustibles' },
    update: {},
    create: {
      nombre: 'Combustibles',
      descripcion: 'Productos de combustible para vehículos',
    },
  });

  const lubricantesCategory = await prisma.categoria.upsert({
    where: { nombre: 'Lubricantes' },
    update: {},
    create: {
      nombre: 'Lubricantes',
      descripcion: 'Aceites y lubricantes para vehículos',
    },
  });

  const accesoriosCategory = await prisma.categoria.upsert({
    where: { nombre: 'Accesorios' },
    update: {},
    create: {
      nombre: 'Accesorios',
      descripcion: 'Accesorios y productos varios',
    },
  });

  console.log('✅ Categorías creadas');

  // Crear productos básicos
  console.log('🛢️ Creando productos...');
  
  const gasolina95 = await prisma.producto.upsert({
    where: { codigo: 'GASOL-95' },
    update: {},
    create: {
      codigo: 'GASOL-95',
      nombre: 'Gasolina 95 Octanos',
      descripcion: 'Gasolina sin plomo 95 octanos',
      unidadMedida: 'litros',
      precio: 1.45,
      stockMinimo: 1000,
      stockActual: 5000,
      esCombustible: true,
      categoriaId: combustibleCategory.id,
    },
  });

  const gasolina98 = await prisma.producto.upsert({
    where: { codigo: 'GASOL-98' },
    update: {},
    create: {
      codigo: 'GASOL-98',
      nombre: 'Gasolina 98 Octanos',
      descripcion: 'Gasolina sin plomo 98 octanos premium',
      unidadMedida: 'litros',
      precio: 1.55,
      stockMinimo: 500,
      stockActual: 2000,
      esCombustible: true,
      categoriaId: combustibleCategory.id,
    },
  });

  const diesel = await prisma.producto.upsert({
    where: { codigo: 'DIESEL' },
    update: {},
    create: {
      codigo: 'DIESEL',
      nombre: 'Diésel',
      descripcion: 'Combustible diésel para vehículos',
      unidadMedida: 'litros',
      precio: 1.35,
      stockMinimo: 1500,
      stockActual: 6000,
      esCombustible: true,
      categoriaId: combustibleCategory.id,
    },
  });

  const aceite5w30 = await prisma.producto.upsert({
    where: { codigo: 'ACEITE-5W30' },
    update: {},
    create: {
      codigo: 'ACEITE-5W30',
      nombre: 'Aceite Motor 5W-30',
      descripcion: 'Aceite sintético para motor 5W-30',
      unidadMedida: 'litros',
      precio: 25.50,
      stockMinimo: 20,
      stockActual: 100,
      esCombustible: false,
      categoriaId: lubricantesCategory.id,
    },
  });

  console.log('✅ Productos creados');

  // Crear tanques para combustibles
  console.log('⛽ Creando tanques...');
  
  await prisma.tanque.upsert({
    where: { numero: 'TANQUE-01' },
    update: {},
    create: {
      numero: 'TANQUE-01',
      capacidadTotal: 10000,
      nivelActual: 5000,
      nivelMinimo: 1000,
      productoId: gasolina95.id,
    },
  });

  await prisma.tanque.upsert({
    where: { numero: 'TANQUE-02' },
    update: {},
    create: {
      numero: 'TANQUE-02',
      capacidadTotal: 8000,
      nivelActual: 2000,
      nivelMinimo: 500,
      productoId: gasolina98.id,
    },
  });

  await prisma.tanque.upsert({
    where: { numero: 'TANQUE-03' },
    update: {},
    create: {
      numero: 'TANQUE-03',
      capacidadTotal: 12000,
      nivelActual: 6000,
      nivelMinimo: 1500,
      productoId: diesel.id,
    },
  });

  console.log('✅ Tanques creados');

  // Crear un cliente de ejemplo
  console.log('👥 Creando cliente de ejemplo...');
  
  await prisma.cliente.upsert({
    where: { numeroDocumento: '12345678A' },
    update: {},
    create: {
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678A',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@email.com',
      telefono: '987654321',
      direccion: 'Calle Principal 123',
    },
  });

  console.log('✅ Cliente creado');

  console.log('🎉 Seed completado exitosamente!');
  console.log('📧 Usuario admin: admin@estacion.com');
  console.log('🔑 Contraseña admin: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 