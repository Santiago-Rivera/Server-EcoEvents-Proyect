import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    // Eliminar todos los eventos
    const deletedEvents = await prisma.event.deleteMany({});
    console.log(`✅ Eliminados ${deletedEvents.count} eventos de la base de datos`);
    
    // Verificar que la tabla esté vacía
    const remainingEvents = await prisma.event.findMany();
    console.log(`📊 Eventos restantes: ${remainingEvents.length}`);
    
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
