import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear roles
  console.log('Creando roles...');
  
  const adminRole = await prisma.rol.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: {
      nombre: 'admin',
      descripcion: 'Administrador con acceso completo al sistema',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Manejar migración de 'gerente' a 'manager'
  const existingGerenteRole = await prisma.rol.findUnique({
    where: { nombre: 'gerente' }
  });

  const existingManagerRole = await prisma.rol.findUnique({
    where: { nombre: 'manager' }
  });

  let managerRole;

  if (existingGerenteRole && !existingManagerRole) {
    // Si existe 'gerente' pero no 'manager', actualizar 'gerente' a 'manager'
    managerRole = await prisma.rol.update({
      where: { nombre: 'gerente' },
      data: { 
        nombre: 'manager', 
        descripcion: 'Manager with access to operations and reports' 
      }
    });
    console.log('Rol gerente migrado a manager:', managerRole);
  } else if (existingGerenteRole && existingManagerRole) {
    // Si ambos existen, eliminar 'gerente' y mantener 'manager'
    await prisma.rol.delete({
      where: { nombre: 'gerente' }
    });
    managerRole = existingManagerRole;
    console.log('Rol gerente eliminado, manteniendo manager');
  } else if (!existingManagerRole) {
    // Si no existe 'manager', crearlo
    managerRole = await prisma.rol.create({
      data: {
        nombre: 'manager',
        descripcion: 'Manager with access to operations and reports',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    console.log('Rol Manager creado:', managerRole);
  } else {
    // Si solo existe 'manager', usarlo
    managerRole = existingManagerRole;
    console.log('Rol Manager ya existe');
  }

  // Manejar migración de 'empleado' a 'employee'
  const existingEmpleadoRole = await prisma.rol.findUnique({
    where: { nombre: 'empleado' }
  });

  const existingEmployeeRole = await prisma.rol.findUnique({
    where: { nombre: 'employee' }
  });

  let employeeRole;

  if (existingEmpleadoRole && !existingEmployeeRole) {
    // Si existe 'empleado' pero no 'employee', actualizar 'empleado' a 'employee'
    employeeRole = await prisma.rol.update({
      where: { nombre: 'empleado' },
      data: { 
        nombre: 'employee', 
        descripcion: 'Employee with basic access to sales' 
      }
    });
    console.log('Rol empleado migrado a employee:', employeeRole);
  } else if (existingEmpleadoRole && existingEmployeeRole) {
    // Si ambos existen, eliminar 'empleado' y mantener 'employee'
    await prisma.rol.delete({
      where: { nombre: 'empleado' }
    });
    employeeRole = existingEmployeeRole;
    console.log('Rol empleado eliminado, manteniendo employee');
  } else if (!existingEmployeeRole) {
    // Si no existe 'employee', crearlo
    employeeRole = await prisma.rol.create({
      data: {
        nombre: 'employee',
        descripcion: 'Employee with basic access to sales',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    console.log('Rol Employee creado:', employeeRole);
  } else {
    // Si solo existe 'employee', usarlo
    employeeRole = existingEmployeeRole;
    console.log('Rol Employee ya existe');
  }

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

  // Crear usuario gerente
  console.log('👤 Creando usuario gerente...');
  
  const managerHashedPassword = await bcrypt.hash('manager123', 12);
  
  const managerUser = await prisma.usuario.upsert({
    where: { email: 'gerente@estacion.com' },
    update: {},
    create: {
      email: 'gerente@estacion.com',
      username: 'gerente',
      password: managerHashedPassword,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      telefono: '987654321',
      emailVerified: true,
      rolId: managerRole.id,
    },
  });

  console.log('✅ Usuario gerente creado');

  // Crear empleados
  console.log('👤 Creando empleados...');
  
  const employeeHashedPassword = await bcrypt.hash('empleado123', 12);
  
  const empleados = [
    {
      email: 'maria.garcia@estacion.com',
      username: 'maria.garcia',
      nombre: 'María',
      apellido: 'García',
      telefono: '956789123'
    },
    {
      email: 'pedro.lopez@estacion.com',
      username: 'pedro.lopez',
      nombre: 'Pedro',
      apellido: 'López',
      telefono: '934567812'
    },
    {
      email: 'ana.martinez@estacion.com',
      username: 'ana.martinez',
      nombre: 'Ana',
      apellido: 'Martínez',
      telefono: '912345678'
    },
    {
      email: 'luis.fernandez@estacion.com',
      username: 'luis.fernandez',
      nombre: 'Luis',
      apellido: 'Fernández',
      telefono: '923456789'
    }
  ];

  for (const empleado of empleados) {
    await prisma.usuario.upsert({
      where: { email: empleado.email },
      update: {},
      create: {
        email: empleado.email,
        username: empleado.username,
        password: employeeHashedPassword,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        telefono: empleado.telefono,
        emailVerified: true,
        rolId: employeeRole.id,
      },
    });
  }

  console.log('✅ Empleados creados');

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

  // Crear surtidores
  console.log('🚗 Creando surtidores...');

  const surtidores = [
    {
      numero: 'PUMP-01',
      nombre: 'Surtidor Principal 1',
      descripcion: 'Surtidor principal con 2 mangueras',
      ubicacion: 'Zona A - Entrada',
      cantidadMangueras: 2,
      activo: true,
      fechaInstalacion: new Date('2024-01-01'),
      observaciones: 'Surtidor en óptimas condiciones',
      mangueras: [
        {
          numero: 'M1',
          color: 'Verde',
          productoId: gasolina95.id, // Gasolina 95
          activo: true,
        },
        {
          numero: 'M2',
          color: 'Negro',
          productoId: diesel.id, // Diesel
          activo: true,
        },
      ],
    },
    {
      numero: 'PUMP-02',
      nombre: 'Surtidor Principal 2',
      descripcion: 'Surtidor principal con 2 mangueras',
      ubicacion: 'Zona A - Centro',
      cantidadMangueras: 2,
      activo: true,
      fechaInstalacion: new Date('2024-01-01'),
      observaciones: 'Surtidor en óptimas condiciones',
      mangueras: [
        {
          numero: 'M1',
          color: 'Verde',
          productoId: gasolina95.id, // Gasolina 95
          activo: true,
        },
        {
          numero: 'M2',
          color: 'Negro',
          productoId: diesel.id, // Diesel
          activo: true,
        },
      ],
    },
    {
      numero: 'PUMP-03',
      nombre: 'Surtidor Económico',
      descripcion: 'Surtidor económico con 1 manguera',
      ubicacion: 'Zona B - Lateral',
      cantidadMangueras: 1,
      activo: true,
      fechaInstalacion: new Date('2024-01-15'),
      observaciones: 'Surtidor para tráfico liviano',
      mangueras: [
        {
          numero: 'M1',
          color: 'Verde',
          productoId: gasolina95.id, // Gasolina 95
          activo: true,
        },
      ],
    },
  ];

  for (const surtidorData of surtidores) {
    const { mangueras, ...surtidorInfo } = surtidorData;
    
    const surtidorExistente = await prisma.surtidor.findUnique({
      where: { numero: surtidorInfo.numero }
    });

    if (surtidorExistente) {
      console.log(`⚠️  Surtidor ${surtidorInfo.numero} ya existe, saltando...`);
      continue;
    }

    const surtidor = await prisma.surtidor.create({
      data: {
        ...surtidorInfo,
        mangueras: {
          create: mangueras,
        },
      },
      include: {
        mangueras: {
          include: {
            producto: true,
          },
        },
      },
    });

    console.log(`✅ Surtidor creado: ${surtidor.numero} - ${surtidor.nombre}`);
    console.log(`   Mangueras: ${surtidor.mangueras.length}`);
    surtidor.mangueras.forEach(manguera => {
      console.log(`     - ${manguera.numero} (${manguera.color}): ${manguera.producto.nombre}`);
    });
  }

  console.log('✅ Surtidores creados');

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