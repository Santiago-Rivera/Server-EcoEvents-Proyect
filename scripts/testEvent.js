// Script para crear un evento de prueba
const fetch = require('node-fetch');

const crearEventoPrueba = async () => {
    try {
        const eventoData = {
            nombre: "Limpieza de Playa Ecológica",
            descripcion: "Únete a nosotros para limpiar la playa y proteger la vida marina. Actividad familiar.",
            fecha: "2025-07-15T10:00:00.000Z",
            ubicacion: "Playa del Carmen, Quintana Roo",
            maxParticipantes: 50
        };

        const response = await fetch('http://localhost:4000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Para esta prueba usaremos un token de prueba
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBlY29ldmVudG9zLmNvbSIsImlhdCI6MTczNTA3ODgwMCwiZXhwIjoxNzM1NjgzNjAwfQ.test'
            },
            body: JSON.stringify(eventoData)
        });

        if (response.ok) {
            const nuevoEvento = await response.json();
            console.log('✅ Evento creado exitosamente:', nuevoEvento);
        } else {
            const error = await response.text();
            console.log('❌ Error al crear evento:', error);
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
    }
};

crearEventoPrueba();
