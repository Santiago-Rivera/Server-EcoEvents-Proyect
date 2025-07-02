import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Insertando datos de prueba...');

  // Crear usuarios de prueba
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecoeventos.com' },
    update: {},
    create: {
      name: 'Administrador EcoEventos',
      email: 'admin@ecoeventos.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'organizador@ecoeventos.com' },
    update: {},
    create: {
      name: 'María González',
      email: 'organizador@ecoeventos.com',
      password: userPassword,
      role: 'ORGANIZER'
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'usuario@ecoeventos.com' },
    update: {},
    create: {
      name: 'Juan Pérez',
      email: 'usuario@ecoeventos.com',
      password: userPassword,
      role: 'USER'
    }
  });

  // Crear eventos de prueba
  const eventos = [
    {
      nombre: 'Limpieza de Playa Costa Verde',
      descripcion: 'Únete a nosotros en una jornada de limpieza de la playa Costa Verde. Traeremos todos los materiales necesarios.',
      fecha: new Date('2025-07-15T09:00:00Z'),
      ubicacion: 'Playa Costa Verde, Miraflores',
      maxParticipantes: 50,
      organizerId: organizer.id
    },
    {
      nombre: 'Plantación de Árboles en el Parque',
      descripcion: 'Actividad de reforestación en el Parque Municipal. Cada participante plantará al menos un árbol.',
      fecha: new Date('2025-07-22T08:00:00Z'),
      ubicacion: 'Parque Municipal Central',
      maxParticipantes: 30,
      organizerId: organizer.id
    },
    {
      nombre: 'Taller de Reciclaje Creativo',
      descripcion: 'Aprende a crear objetos útiles a partir de materiales reciclables. Trae tus propios materiales.',
      fecha: new Date('2025-07-30T14:00:00Z'),
      ubicacion: 'Centro Comunitario San Isidro',
      maxParticipantes: 25,
      organizerId: admin.id
    },
    {
      nombre: 'Caminata Ecológica por la Reserva',
      descripcion: 'Caminata guiada por la Reserva Natural Local con un biólogo experto. Incluye observación de flora y fauna.',
      fecha: new Date('2025-08-05T07:00:00Z'),
      ubicacion: 'Reserva Natural Los Cedros',
      maxParticipantes: 20,
      organizerId: organizer.id
    },
    {
      nombre: 'Mercado Orgánico Comunitario',
      descripcion: 'Mercado de productos orgánicos locales. Apoya a los productores de tu comunidad.',
      fecha: new Date('2025-08-12T10:00:00Z'),
      ubicacion: 'Plaza Principal del Distrito',
      maxParticipantes: null, // Sin límite
      organizerId: admin.id
    }
  ];

  for (const eventoData of eventos) {
    await prisma.event.upsert({
      where: { 
        id: eventos.indexOf(eventoData) + 1
      },
      update: {},
      create: eventoData
    });
  }

  // Crear algunas inscripciones de prueba
  await prisma.registration.upsert({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId: 1
      }
    },
    update: {},
    create: {
      userId: user.id,
      eventId: 1
    }
  });

  await prisma.registration.upsert({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId: 2
      }
    },
    update: {},
    create: {
      userId: user.id,
      eventId: 2
    }
  });

  console.log('✅ Datos de prueba insertados correctamente');
  console.log('\n📋 Usuarios creados:');
  console.log('Admin: admin@ecoeventos.com / admin123');
  console.log('Organizador: organizador@ecoeventos.com / user123');
  console.log('Usuario: usuario@ecoeventos.com / user123');
  console.log('\n🎉 ¡Listo para probar la aplicación!');
}

main()
  .catch((e) => {
    console.error('❌ Error insertando datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
