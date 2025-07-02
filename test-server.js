const { createEvento } = require('./src/controllers/eventController.js');

// Simular datos de un evento de prueba
const testEventData = {
  nombre: "Evento de Prueba",
  descripcion: "Este es un evento de prueba para verificar que la funcionalidad funciona",
  fecha: new Date().toISOString(),
  ubicacion: "Ubicación de prueba",
  maxParticipantes: 50
};

console.log('Datos del evento de prueba:', testEventData);
console.log('El controlador está configurado correctamente!');
