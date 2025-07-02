import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Crear usuario administrador
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador EcoEventos',
        email: 'admin@ecoeventos.com',
        password: 'admin123', // En producción usar bcrypt
        role: 'ADMIN'
      }
    });

    console.log('✅ Usuario administrador creado:', admin);

    // Crear eventos de prueba
    const evento1 = await prisma.event.create({
      data: {
        title: 'Limpieza de Playa Sostenible',
        description: 'Únete a nosotros para una jornada de limpieza de playa y concientización ambiental. Incluye charla sobre microplásticos y su impacto en la vida marina.',
        date: new Date('2025-07-15T09:00:00Z'),
        location: 'Playa Santa Ana, Guayas',
        maxParticipants: 50,
        createdBy: admin.id
      }
    });

    const evento2 = await prisma.event.create({
      data: {
        title: 'Taller de Reciclaje Creativo',
        description: 'Aprende a crear objetos útiles y decorativos a partir de materiales reciclados. Trae tus botellas plásticas y cartones.',
        date: new Date('2025-07-20T14:00:00Z'),
        location: 'Centro Comunitario La Floresta, Quito',
        maxParticipants: 30,
        createdBy: admin.id
      }
    });

    const evento3 = await prisma.event.create({
      data: {
        title: 'Plantación de Árboles Nativos',
        description: 'Jornada de reforestación en el área metropolitana. Contribuye a la restauración del ecosistema local plantando especies nativas.',
        date: new Date('2025-08-05T07:30:00Z'),
        location: 'Parque Nacional Yasuni',
        maxParticipants: 100,
        createdBy: admin.id
      }
    });

    console.log('✅ Eventos creados:');
    console.log('- ', evento1.title);
    console.log('- ', evento2.title);
    console.log('- ', evento3.title);

    console.log('🎉 Base de datos inicializada correctamente!');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
