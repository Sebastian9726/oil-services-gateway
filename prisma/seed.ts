import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed completo de la base de datos...');

  // 1. CREAR EMPRESAS
  console.log('🏢 Creando empresas...');
  
  const empresaPrincipal = await prisma.empresa.upsert({
    where: { rut: '12345678901' },
    update: {},
    create: {
      rut: '12345678901',
      razonSocial: 'Estación de Servicios Principal S.A.C.',
      nombre: 'Estación Principal',
      nombreComercial: 'EsPrincipal',
      direccion: 'Av. Principal 123',
      ciudad: 'Lima',
      provincia: 'Lima',
      pais: 'Perú',
      codigoPostal: '15001',
      telefono: '01-234-5678',
      telefonoMovil: '987-654-321',
      email: 'info@estacionprincipal.com',
      sitioWeb: 'https://www.estacionprincipal.com',
      sector: 'Combustibles y Lubricantes',
      tipoEmpresa: 'S.A.C.',
      fechaConstitucion: new Date('2020-01-01'),
      activo: true,
    },
  });

  const empresaSecundaria = await prisma.empresa.upsert({
    where: { rut: '98765432109' },
    update: {},
    create: {
      rut: '98765432109',
      razonSocial: 'Estación Norte S.R.L.',
      nombre: 'Estación Norte',
      nombreComercial: 'EsNorte',
      direccion: 'Av. Norte 456',
      ciudad: 'Lima',
      provincia: 'Lima',
      pais: 'Perú',
      codigoPostal: '15002',
      telefono: '01-345-6789',
      telefonoMovil: '976-543-210',
      email: 'info@estacionnorte.com',
      sitioWeb: 'https://www.estacionnorte.com',
      sector: 'Combustibles y Lubricantes',
      tipoEmpresa: 'S.R.L.',
      fechaConstitucion: new Date('2021-03-15'),
      activo: true,
    },
  });

  console.log('✅ Empresas creadas:', empresaPrincipal.nombre, empresaSecundaria.nombre);

  // 2. CREAR PUNTOS DE VENTA
  console.log('🏪 Creando puntos de venta...');
  
  const puntoVentaPrincipal = await prisma.puntoVenta.upsert({
    where: { codigo: 'PV-001' },
    update: {},
    create: {
      codigo: 'PV-001',
      nombre: 'Punto de Venta Principal',
      descripcion: 'Punto de venta principal de la estación',
      direccion: 'Av. Principal 123',
      ciudad: 'Lima',
      provincia: 'Lima',
      pais: 'Perú',
      codigoPostal: '15001',
      telefono: '01-234-5678',
      telefonoMovil: '987-654-321',
      email: 'ventas@estacionprincipal.com',
      horarioApertura: '06:00',
      horarioCierre: '23:00',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      coordenadasGPS: '-12.0464,-77.0428',
      tipoEstacion: 'urbana',
      serviciosAdicionales: ['tienda', 'lavado', 'aire_agua'],
      capacidadMaxima: 50000,
      fechaApertura: new Date('2020-01-15'),
      activo: true,
      empresaId: empresaPrincipal.id,
    },
  });

  const puntoVentaNorte = await prisma.puntoVenta.upsert({
    where: { codigo: 'PV-002' },
    update: {},
    create: {
      codigo: 'PV-002',
      nombre: 'Punto de Venta Norte',
      descripcion: 'Sucursal zona norte',
      direccion: 'Av. Norte 456',
      ciudad: 'Lima',
      provincia: 'Lima',
      pais: 'Perú',
      codigoPostal: '15002',
      telefono: '01-345-6789',
      telefonoMovil: '976-543-210',
      email: 'norte@estacionprincipal.com',
      horarioApertura: '05:30',
      horarioCierre: '22:30',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      coordenadasGPS: '-12.0234,-77.0567',
      tipoEstacion: 'carretera',
      serviciosAdicionales: ['tienda', 'restaurante', 'estacionamiento'],
      capacidadMaxima: 40000,
      fechaApertura: new Date('2020-06-01'),
      activo: true,
      empresaId: empresaPrincipal.id,
    },
  });

  const puntoVentaSur = await prisma.puntoVenta.upsert({
    where: { codigo: 'PV-003' },
    update: {},
    create: {
      codigo: 'PV-003',
      nombre: 'Punto de Venta Sur',
      descripcion: 'Sucursal zona sur',
      direccion: 'Av. Sur 789',
      ciudad: 'Lima',
      provincia: 'Lima',
      pais: 'Perú',
      codigoPostal: '15003',
      telefono: '01-456-7890',
      telefonoMovil: '965-432-109',
      email: 'sur@estacionprincipal.com',
      horarioApertura: '06:00',
      horarioCierre: '23:30',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      coordenadasGPS: '-12.0634,-77.0328',
      tipoEstacion: 'urbana',
      serviciosAdicionales: ['tienda', 'lavado', 'aire_agua', 'cajero'],
      capacidadMaxima: 45000,
      fechaApertura: new Date('2020-09-15'),
      activo: true,
      empresaId: empresaPrincipal.id,
    },
  });

  const puntoVentaIndependiente = await prisma.puntoVenta.upsert({
    where: { codigo: 'PV-004' },
    update: {},
    create: {
      codigo: 'PV-004',
      nombre: 'Estación Norte Independiente',
      descripcion: 'Punto de venta de empresa independiente',
      direccion: 'Av. Independencia 321',
      ciudad: 'Lima',
      provincia: 'Lima',
      pais: 'Perú',
      codigoPostal: '15004',
      telefono: '01-567-8901',
      telefonoMovil: '954-321-098',
      email: 'ventas@estacionnorte.com',
      horarioApertura: '05:00',
      horarioCierre: '24:00',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      coordenadasGPS: '-12.0134,-77.0667',
      tipoEstacion: 'carretera',
      serviciosAdicionales: ['tienda', 'restaurante', 'estacionamiento', 'taller'],
      capacidadMaxima: 35000,
      fechaApertura: new Date('2021-04-01'),
      activo: true,
      empresaId: empresaSecundaria.id,
    },
  });

  console.log('✅ Puntos de venta creados:', puntoVentaPrincipal.nombre, puntoVentaNorte.nombre, puntoVentaSur.nombre, puntoVentaIndependiente.nombre);

  // 3. CREAR ROLES
  console.log('👔 Creando roles...');
  
  const adminRole = await prisma.rol.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: {
      nombre: 'admin',
      descripcion: 'Administrador con acceso completo al sistema',
      permisos: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE_USERS', 'MANAGE_INVENTORY', 'VIEW_REPORTS'],
      activo: true,
    },
  });

  const managerRole = await prisma.rol.upsert({
    where: { nombre: 'manager' },
    update: {},
    create: {
      nombre: 'manager',
      descripcion: 'Gerente con acceso a operaciones y reportes',
      permisos: ['CREATE', 'READ', 'UPDATE', 'MANAGE_INVENTORY', 'VIEW_REPORTS'],
      activo: true,
    },
  });

  const employeeRole = await prisma.rol.upsert({
    where: { nombre: 'employee' },
    update: {},
    create: {
      nombre: 'employee',
      descripcion: 'Empleado con acceso básico a ventas',
      permisos: ['CREATE', 'READ', 'UPDATE'],
      activo: true,
    },
  });

  const supervisorRole = await prisma.rol.upsert({
    where: { nombre: 'supervisor' },
    update: {},
    create: {
      nombre: 'supervisor',
      descripcion: 'Supervisor con acceso a múltiples puntos de venta',
      permisos: ['CREATE', 'READ', 'UPDATE', 'VIEW_REPORTS'],
      activo: true,
    },
  });

  console.log('✅ Roles creados');

  // 4. CREAR USUARIOS CON DIFERENTES RELACIONES
  console.log('👤 Creando usuarios con diferentes relaciones...');
  
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const managerHashedPassword = await bcrypt.hash('manager123', 12);
  const employeeHashedPassword = await bcrypt.hash('empleado123', 12);
  
  // Admin con acceso a todos los puntos de venta de la empresa principal
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@estacion.com' },
    update: {
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        set: [
          { id: puntoVentaPrincipal.id },
          { id: puntoVentaNorte.id },
          { id: puntoVentaSur.id }
        ]
      },
    },
    create: {
      email: 'admin@estacion.com',
      username: 'admin',
      password: hashedPassword,
      nombre: 'Administrador',
      apellido: 'Sistema',
      telefono: '123456789',
      emailVerified: true,
      rolId: adminRole.id,
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        connect: [
          { id: puntoVentaPrincipal.id },
          { id: puntoVentaNorte.id },
          { id: puntoVentaSur.id }
        ]
      },
    },
  });

  // Gerente con acceso a 2 puntos de venta
  const gerenteUser = await prisma.usuario.upsert({
    where: { email: 'gerente@estacion.com' },
    update: {
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        set: [
          { id: puntoVentaPrincipal.id },
          { id: puntoVentaNorte.id }
        ]
      },
    },
    create: {
      email: 'gerente@estacion.com',
      username: 'gerente',
      password: managerHashedPassword,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      telefono: '987654321',
      emailVerified: true,
      rolId: managerRole.id,
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        connect: [
          { id: puntoVentaPrincipal.id },
          { id: puntoVentaNorte.id }
        ]
      },
    },
  });

  // Supervisor con acceso a puntos de venta norte y sur
  const supervisorUser = await prisma.usuario.upsert({
    where: { email: 'supervisor@estacion.com' },
    update: {
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        set: [
          { id: puntoVentaNorte.id },
          { id: puntoVentaSur.id }
        ]
      },
    },
    create: {
      email: 'supervisor@estacion.com',
      username: 'supervisor',
      password: hashedPassword,
      nombre: 'María',
      apellido: 'González',
      telefono: '976543210',
      emailVerified: true,
      rolId: supervisorRole.id,
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        connect: [
          { id: puntoVentaNorte.id },
          { id: puntoVentaSur.id }
        ]
      },
    },
  });

  // Empleado solo del punto de venta principal
  const empleadoPrincipal = await prisma.usuario.upsert({
    where: { email: 'empleado.principal@estacion.com' },
    update: {
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        set: [{ id: puntoVentaPrincipal.id }]
      },
    },
    create: {
      email: 'empleado.principal@estacion.com',
      username: 'empleado_principal',
      password: employeeHashedPassword,
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '965432109',
      emailVerified: true,
      rolId: employeeRole.id,
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        connect: [{ id: puntoVentaPrincipal.id }]
      },
    },
  });

  // Empleado solo del punto de venta norte
  const empleadoNorte = await prisma.usuario.upsert({
    where: { email: 'empleado.norte@estacion.com' },
    update: {
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        set: [{ id: puntoVentaNorte.id }]
      },
    },
    create: {
      email: 'empleado.norte@estacion.com',
      username: 'empleado_norte',
      password: employeeHashedPassword,
      nombre: 'Ana',
      apellido: 'García',
      telefono: '954321098',
      emailVerified: true,
      rolId: employeeRole.id,
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        connect: [{ id: puntoVentaNorte.id }]
      },
    },
  });

  // Empleado solo del punto de venta sur
  const empleadoSur = await prisma.usuario.upsert({
    where: { email: 'empleado.sur@estacion.com' },
    update: {
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        set: [{ id: puntoVentaSur.id }]
      },
    },
    create: {
      email: 'empleado.sur@estacion.com',
      username: 'empleado_sur',
      password: employeeHashedPassword,
      nombre: 'Luis',
      apellido: 'Martínez',
      telefono: '943210987',
      emailVerified: true,
      rolId: employeeRole.id,
      empresaId: empresaPrincipal.id,
      puntosVenta: {
        connect: [{ id: puntoVentaSur.id }]
      },
    },
  });

  // Gerente de empresa independiente
  const gerenteIndependiente = await prisma.usuario.upsert({
    where: { email: 'gerente@estacionnorte.com' },
    update: {
      empresaId: empresaSecundaria.id,
      puntosVenta: {
        set: [{ id: puntoVentaIndependiente.id }]
      },
    },
    create: {
      email: 'gerente@estacionnorte.com',
      username: 'gerente_independiente',
      password: managerHashedPassword,
      nombre: 'Roberto',
      apellido: 'Silva',
      telefono: '932109876',
      emailVerified: true,
      rolId: managerRole.id,
      empresaId: empresaSecundaria.id,
      puntosVenta: {
        connect: [{ id: puntoVentaIndependiente.id }]
      },
    },
  });

  console.log('✅ Usuarios creados con diferentes relaciones empresa-puntos de venta');

  // 5. CREAR CATEGORÍAS
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

  const tiendaCategory = await prisma.categoria.upsert({
    where: { nombre: 'Tienda' },
    update: {},
    create: {
      nombre: 'Tienda',
      descripcion: 'Productos de tienda y conveniencia',
    },
  });

  console.log('✅ Categorías creadas');

  // 6. CREAR PRODUCTOS
  console.log('🛢️ Creando productos...');
  
  const gasolina95 = await prisma.producto.upsert({
    where: { codigo: 'GASOL-95' },
    update: {},
    create: {
      codigo: 'GASOL-95',
      nombre: 'Gasolina 95 Octanos',
      descripcion: 'Gasolina sin plomo 95 octanos premium',
      unidadMedida: 'Galones',
      precioCompra: 12500, // Precio de compra en COP
      precioVenta: 15900,  // Precio de venta en COP  
      moneda: 'COP',
      stockMinimo: 1000,
      stockActual: 5000,
      esCombustible: true,
      categoriaId: combustibleCategory.id,
    },
  });

  const diesel = await prisma.producto.upsert({
    where: { codigo: 'DIESEL' },
    update: {},
    create: {
      codigo: 'DIESEL',
      nombre: 'Diesel B5',
      descripcion: 'Diesel con 5% de biodiesel',
      unidadMedida: 'Galones',
      precioCompra: 11200, // Precio de compra en COP
      precioVenta: 14300,  // Precio de venta en COP
      moneda: 'COP',
      stockMinimo: 800,
      stockActual: 4000,
      esCombustible: true,
      categoriaId: combustibleCategory.id,
    },
  });

  const gasolina90 = await prisma.producto.upsert({
    where: { codigo: 'GASOL-90' },
    update: {},
    create: {
      codigo: 'GASOL-90',
      nombre: 'Gasolina 90 Octanos',
      descripcion: 'Gasolina sin plomo 90 octanos',
      unidadMedida: 'Galones',
      precioCompra: 11800, // Precio de compra en COP
      precioVenta: 14990,  // Precio de venta en COP
      moneda: 'COP',
      stockMinimo: 1200,
      stockActual: 6000,
      esCombustible: true,
      categoriaId: combustibleCategory.id,
    },
  });

  const hidroblue = await prisma.producto.upsert({
    where: { codigo: 'HIDROBLUE' },
    update: {},
    create: {
      codigo: 'HIDROBLUE',
      nombre: 'Hidroblue (AdBlue)',
      descripcion: 'Líquido reductor de emisiones para motores diesel',
      unidadMedida: 'Litros',
      precioCompra: 5200,  // Precio de compra en COP
      precioVenta: 7500,   // Precio de venta en COP
      moneda: 'COP',
      stockMinimo: 50,
      stockActual: 200,
      esCombustible: false,
      categoriaId: combustibleCategory.id,
    },
  });

  console.log('✅ Productos creados');

  // 7. CREAR TANQUES PARA CADA PUNTO DE VENTA
  console.log('⛽ Creando tanques...');
  
  const tanques = [
    // Tanques Punto de Venta Principal
    { numero: 'T-001', puntoVentaId: puntoVentaPrincipal.id, productoId: gasolina95.id, capacidad: 15000 },
    { numero: 'T-002', puntoVentaId: puntoVentaPrincipal.id, productoId: diesel.id, capacidad: 12000 },
    { numero: 'T-003', puntoVentaId: puntoVentaPrincipal.id, productoId: gasolina90.id, capacidad: 18000 },
    
    // Tanques Punto de Venta Norte
    { numero: 'T-004', puntoVentaId: puntoVentaNorte.id, productoId: gasolina95.id, capacidad: 12000 },
    { numero: 'T-005', puntoVentaId: puntoVentaNorte.id, productoId: diesel.id, capacidad: 10000 },
    { numero: 'T-006', puntoVentaId: puntoVentaNorte.id, productoId: gasolina90.id, capacidad: 15000 },
    
    // Tanques Punto de Venta Sur
    { numero: 'T-007', puntoVentaId: puntoVentaSur.id, productoId: gasolina95.id, capacidad: 14000 },
    { numero: 'T-008', puntoVentaId: puntoVentaSur.id, productoId: diesel.id, capacidad: 11000 },
    { numero: 'T-009', puntoVentaId: puntoVentaSur.id, productoId: gasolina90.id, capacidad: 16000 },
    
    // Tanques Punto de Venta Independiente
    { numero: 'T-010', puntoVentaId: puntoVentaIndependiente.id, productoId: gasolina95.id, capacidad: 10000 },
    { numero: 'T-011', puntoVentaId: puntoVentaIndependiente.id, productoId: diesel.id, capacidad: 8000 },
  ];

  for (const tanque of tanques) {
    await prisma.tanque.upsert({
      where: { 
        puntoVentaId_numero: { 
          puntoVentaId: tanque.puntoVentaId, 
          numero: tanque.numero 
        } 
      },
      update: {},
      create: {
        numero: tanque.numero,
        capacidadTotal: tanque.capacidad,
        nivelActual: tanque.capacidad * 0.7, // 70% lleno
        nivelMinimo: tanque.capacidad * 0.1, // 10% mínimo
        productoId: tanque.productoId,
        puntoVentaId: tanque.puntoVentaId,
      },
    });
  }

  console.log('✅ Tanques creados');

  // 8. CREAR SURTIDORES Y MANGUERAS
  console.log('🚗 Creando surtidores y mangueras...');
  
  const surtidores = [
    // Surtidores Punto de Venta Principal
    { 
      numero: 'S-001', 
      nombre: 'Surtidor Principal 1', 
      puntoVentaId: puntoVentaPrincipal.id,
      mangueras: [
        { numero: '2', color: 'Negro', productoId: diesel.id },
        { numero: '3', color: 'Azul', productoId: gasolina90.id },
      ]
    },
    { 
      numero: 'S-002', 
      nombre: 'Surtidor Principal 2', 
      puntoVentaId: puntoVentaPrincipal.id,
      mangueras: [
        { numero: '2', color: 'Negro', productoId: hidroblue.id },
      ]
    },
    
    // Surtidores Punto de Venta Norte
    { 
      numero: 'S-003', 
      nombre: 'Surtidor Norte 1', 
      puntoVentaId: puntoVentaNorte.id,
      mangueras: [
        { numero: '2', color: 'Negro', productoId: diesel.id },
        { numero: '3', color: 'Azul', productoId: gasolina90.id },
      ]
    },
    
    // Surtidores Punto de Venta Sur
    { 
      numero: 'S-004', 
      nombre: 'Surtidor Sur 1', 
      puntoVentaId: puntoVentaSur.id,
      mangueras: [
        { numero: '1', color: 'Rojo', productoId: gasolina90.id },
        { numero: '2', color: 'Negro', productoId: diesel.id },
      ]
    },
    
    // Surtidores Punto de Venta Independiente
    { 
      numero: 'S-005', 
      nombre: 'Surtidor Independiente 1', 
      puntoVentaId: puntoVentaIndependiente.id,
      mangueras: [
        { numero: '1', color: 'Rojo', productoId: gasolina90.id },
        { numero: '2', color: 'Negro', productoId: diesel.id },
      ]
    },
  ];

  for (const surtidor of surtidores) {
    const createdSurtidor = await prisma.surtidor.upsert({
      where: { 
        puntoVentaId_numero: { 
          puntoVentaId: surtidor.puntoVentaId, 
          numero: surtidor.numero 
        } 
      },
      update: {},
      create: {
        numero: surtidor.numero,
        nombre: surtidor.nombre,
        descripcion: `Surtidor ${surtidor.numero}`,
        ubicacion: 'Zona de despacho',
        cantidadMangueras: surtidor.mangueras.length,
        fechaInstalacion: new Date('2020-01-01'),
        puntoVentaId: surtidor.puntoVentaId,
      },
    });

    // Crear mangueras para cada surtidor
    for (const manguera of surtidor.mangueras) {
      await prisma.mangueraSurtidor.upsert({
        where: { 
          surtidorId_numero: { 
            surtidorId: createdSurtidor.id, 
            numero: manguera.numero 
          } 
        },
        update: {},
        create: {
          numero: manguera.numero,
          color: manguera.color,
          lecturaAnterior: 0,
          lecturaActual: Math.floor(Math.random() * 50000) + 10000, // Lectura aleatoria
          surtidorId: createdSurtidor.id,
          productoId: manguera.productoId,
        },
      });
    }
  }

  console.log('✅ Surtidores y mangueras creados');

  // 9. CREAR CLIENTES DE EJEMPLO
  console.log('👥 Creando clientes de ejemplo...');
  
  const clienteEjemplo = await prisma.cliente.upsert({
    where: { numeroDocumento: '12345678' },
    update: {},
    create: {
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      nombre: 'Juan Carlos',
      apellido: 'Pérez González',
      email: 'juancarlos.perez@email.com',
      telefono: '987654321',
      direccion: 'Av. Ejemplo 123',
    },
  });

  const clienteEmpresa = await prisma.cliente.upsert({
    where: { numeroDocumento: '20123456789' },
    update: {},
    create: {
      tipoDocumento: 'RUC',
      numeroDocumento: '20123456789',
      nombre: 'Empresa',
      razonSocial: 'Transportes Rápidos S.A.C.',
      email: 'empresa@transportesrapidos.com',
      telefono: '01-2345678',
      direccion: 'Av. Industrial 456',
    },
  });

  console.log('✅ Clientes creados');

  // 10. CREAR TURNOS DE EJEMPLO
  console.log('🕐 Creando turnos de ejemplo...');
  
  const ahora = new Date();
  const ayer = new Date(ahora);
  ayer.setDate(ayer.getDate() - 1);
  
  const turnoActual = await prisma.turno.create({
    data: {
      fechaInicio: ahora,
      fechaFin: null,
      horaInicio: '08:00',
      horaFin: null,
      observaciones: 'Turno matutino en curso',
      activo: true,
      usuarioId: empleadoPrincipal.id,
      puntoVentaId: puntoVentaPrincipal.id,
    },
  });

  const turnoCompletado = await prisma.turno.create({
    data: {
      fechaInicio: ayer,
      fechaFin: ayer,
      horaInicio: '08:00',
      horaFin: '16:00',
      observaciones: 'Turno matutino completado',
      activo: false,
      usuarioId: empleadoNorte.id,
      puntoVentaId: puntoVentaNorte.id,
    },
  });

  const turnoSupervisor = await prisma.turno.create({
    data: {
      fechaInicio: ahora,
      fechaFin: null,
      horaInicio: '14:00',
      horaFin: null,
      observaciones: 'Turno vespertino supervisión',
      activo: true,
      usuarioId: supervisorUser.id,
      puntoVentaId: puntoVentaSur.id,
    },
  });

  console.log('✅ Turnos de ejemplo creados');

  // 11. CREAR INVENTARIO ACTUAL
  console.log('📊 Creando inventario actual...');
  
  const inventarioData = [
    // Inventario Principal
    { puntoVentaId: puntoVentaPrincipal.id, productoId: gasolina95.id, stockActual: 5000, precio: 15900 },
    { puntoVentaId: puntoVentaPrincipal.id, productoId: diesel.id, stockActual: 4000, precio: 14300 },
    { puntoVentaId: puntoVentaPrincipal.id, productoId: gasolina90.id, stockActual: 6000, precio: 14990 },
    
    // Inventario Norte
    { puntoVentaId: puntoVentaNorte.id, productoId: gasolina95.id, stockActual: 3500, precio: 15900 },
    { puntoVentaId: puntoVentaNorte.id, productoId: diesel.id, stockActual: 2800, precio: 14300 },
    { puntoVentaId: puntoVentaNorte.id, productoId: gasolina90.id, stockActual: 4200, precio: 14990 },
    
    // Inventario Sur
    { puntoVentaId: puntoVentaSur.id, productoId: gasolina95.id, stockActual: 4200, precio: 15900 },
    { puntoVentaId: puntoVentaSur.id, productoId: diesel.id, stockActual: 3200, precio: 14300 },
    { puntoVentaId: puntoVentaSur.id, productoId: gasolina90.id, stockActual: 5000, precio: 14990 },
    
    // Inventario Independiente
    { puntoVentaId: puntoVentaIndependiente.id, productoId: gasolina95.id, stockActual: 2800, precio: 15900 },
    { puntoVentaId: puntoVentaIndependiente.id, productoId: diesel.id, stockActual: 2200, precio: 14300 },
  ];

  for (const inventario of inventarioData) {
    await prisma.inventarioActual.upsert({
      where: { 
        puntoVentaId_productoId: { 
          puntoVentaId: inventario.puntoVentaId, 
          productoId: inventario.productoId 
        } 
      },
      update: {},
      create: {
        stockActual: inventario.stockActual,
        valorInventario: inventario.stockActual * inventario.precio, // Calcular valor total
        fechaActualizacion: new Date(),
        puntoVentaId: inventario.puntoVentaId,
        productoId: inventario.productoId,
      },
    });
  }

  console.log('✅ Inventario actual creado');

  console.log('\n🎉 Seed completo ejecutado exitosamente!');
  console.log('\n📋 RESUMEN DE DATOS CREADOS:');
  console.log(`🏢 Empresas: ${empresaPrincipal.nombre}, ${empresaSecundaria.nombre}`);
  console.log(`🏪 Puntos de Venta: 4 (PV-001, PV-002, PV-003, PV-004)`);
  console.log(`👥 Usuarios: 7 con diferentes roles y relaciones`);
  console.log(`⛽ Tanques: 11 distribuidos en todos los puntos de venta`);
  console.log(`🚗 Surtidores: 5 con múltiples mangueras`);
  console.log(`🕐 Turnos: 3 de ejemplo (1 activo, 1 completado, 1 supervisión)`);
  console.log(`📊 Inventario: Configurado para todos los puntos de venta`);

  console.log('\n🔑 CREDENCIALES DE ACCESO:');
  console.log('📧 Admin: admin@estacion.com | 🔑 Contraseña: admin123');
  console.log('📧 Gerente: gerente@estacion.com | 🔑 Contraseña: manager123');
  console.log('📧 Supervisor: supervisor@estacion.com | 🔑 Contraseña: admin123');
  console.log('📧 Empleado Principal: empleado.principal@estacion.com | 🔑 Contraseña: empleado123');
  console.log('📧 Empleado Norte: empleado.norte@estacion.com | 🔑 Contraseña: empleado123');
  console.log('📧 Empleado Sur: empleado.sur@estacion.com | 🔑 Contraseña: empleado123');
  console.log('📧 Gerente Independiente: gerente@estacionnorte.com | 🔑 Contraseña: manager123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 