import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    // Crear usuario de prueba si no existe
    const existingUser = await prisma.user.findFirst();
    
    if (!existingUser) {
      const testUser = await prisma.user.create({
        data: {
          name: 'Usuario de Prueba',
          email: 'test@example.com',
          password: 'hashedpassword123', // En producción esto debería estar hasheado
          role: 'USER'
        }
      });
      
      console.log('✅ Usuario de prueba creado:', testUser);
    } else {
      console.log('✅ Usuario ya existe:', existingUser);
    }

    // Verificar eventos existentes
    const eventos = await prisma.event.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('📅 Eventos en la base de datos:', eventos.length);
    eventos.forEach(evento => {
      console.log(`- ${evento.title} (${evento.date})`);
    });

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
