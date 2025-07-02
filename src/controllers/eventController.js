import prisma from '../config/database.js';
import nodemailer from 'nodemailer';

// Configurar el transportador de email
const configurarEmail = () => {
  // Para desarrollo, usar configuración de prueba con logs
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@test.com',
        pass: 'test123'
      },
      // Para desarrollo, solo logueamos el email sin enviarlo realmente
      jsonTransport: true
    });
  }
  
  // Para producción, usar un servicio real como Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Función para enviar correo de confirmación
const enviarCorreoConfirmacion = async (participante, evento) => {
  try {
    const transporter = configurarEmail();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Confirmación de Participación - ${evento.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .event-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { background: #e8f5e8; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Participación Confirmada!</h1>
          </div>
          <div class="content">
            <h2>Hola ${participante.nombre},</h2>
            <p>¡Excelente noticia! Tu participación en el evento <strong>${evento.title}</strong> ha sido confirmada exitosamente.</p>
            
            <div class="event-details">
              <h3>📅 Detalles del Evento:</h3>
              <p><strong>Evento:</strong> ${evento.title}</p>
              <p><strong>Fecha:</strong> ${new Date(evento.date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Ubicación:</strong> ${evento.location}</p>
              ${evento.description ? `<p><strong>Descripción:</strong> ${evento.description}</p>` : ''}
            </div>

            <div class="highlight">
              <h3>📋 Información de tu Registro:</h3>
              <p><strong>Nombre:</strong> ${participante.nombre}</p>
              <p><strong>Email:</strong> ${participante.email}</p>
              <p><strong>Teléfono:</strong> ${participante.telefono}</p>
              ${participante.comentarios ? `<p><strong>Comentarios:</strong> ${participante.comentarios}</p>` : ''}
            </div>

            <div class="highlight">
              <h3>🎯 ¿Qué sigue?</h3>
              <ul>
                <li>✅ Guarda este correo como confirmación</li>
                <li>📅 Marca la fecha en tu calendario</li>
                <li>📧 ${participante.recibirNotificaciones ? 'Recibirás recordatorios automáticos' : 'No recibirás recordatorios automáticos'}</li>
                <li>🤝 ¡Prepárate para una experiencia increíble!</li>
              </ul>
            </div>

            <p>Si tienes alguna pregunta sobre el evento, no dudes en contactar al organizador.</p>
            
            <p>¡Nos vemos en el evento!</p>
            <p><strong>Equipo de EcoEventos</strong></p>
          </div>
          <div class="footer">
            <p>Este es un correo automático de confirmación de EcoEventos.</p>
            <p>Por favor, no respondas a este correo.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: '"EcoEventos" <noreply@ecoeventos.com>',
      to: participante.email,
      subject: `✅ Confirmación de participación - ${evento.title}`,
      html: htmlContent
    };

    // En desarrollo, simular el envío y mostrar el contenido del email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [MODO DESARROLLO] Simulando envío de correo:');
      console.log('📧 Para:', participante.email);
      console.log('📧 Asunto:', mailOptions.subject);
      console.log('📧 Contenido HTML guardado en logs');
      
      // Simular éxito
      return { 
        success: true, 
        messageId: 'sim_' + Date.now(),
        message: 'Email simulado en modo desarrollo' 
      };
    }

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    return { success: false, error: error.message };
  }
};

// Obtener todos los eventos
export const getEventos = async (req, res) => {
  try {
    const eventos = await prisma.event.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.json(eventos);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ message: 'Error al obtener eventos' });
  }
};

// Obtener evento por ID
export const getEventoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evento = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    res.json(evento);
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ message: 'Error al obtener evento' });
  }
};

// Crear nuevo evento
export const createEvento = async (req, res) => {
  try {
    const { nombre, descripcion, fecha, ubicacion, maxParticipantes } = req.body;
    
    console.log('Datos recibidos en backend:', { nombre, descripcion, fecha, ubicacion, maxParticipantes });
    
    // Validar datos requeridos
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del evento es requerido' });
    }
    if (!fecha) {
      return res.status(400).json({ message: 'La fecha del evento es requerida' });
    }
    
    // Para desarrollo, usar un userId por defecto si no hay autenticación
    const userId = req.user?.userId || 1;

    const evento = await prisma.event.create({
      data: {
        title: nombre,
        description: descripcion || null,
        date: new Date(fecha),
        location: ubicacion || null,
        maxParticipants: maxParticipantes ? parseInt(maxParticipantes) : null,
        createdBy: userId
      },
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

    console.log('Evento creado:', evento);

    res.status(201).json({
      message: 'Evento creado exitosamente',
      evento
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ message: 'Error al crear evento', error: error.message });
  }
};

// Actualizar evento
export const updateEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, fecha, ubicacion, maxParticipantes } = req.body;
    const userId = req.user.userId;

    // Verificar que el evento existe y que el usuario es el organizador
    const eventoExistente = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!eventoExistente) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (eventoExistente.organizerId !== userId) {
      return res.status(403).json({ message: 'No tienes permisos para editar este evento' });
    }

    const evento = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        descripcion,
        fecha: new Date(fecha),
        ubicacion,
        maxParticipantes: maxParticipantes ? parseInt(maxParticipantes) : null
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Evento actualizado exitosamente',
      evento
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ message: 'Error al actualizar evento' });
  }
};

// Eliminar evento
export const deleteEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar que el evento existe y que el usuario es el organizador
    const eventoExistente = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!eventoExistente) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (eventoExistente.organizerId !== userId) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este evento' });
    }

    await prisma.event.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ message: 'Error al eliminar evento' });
  }
};

// Registrarse a un evento
export const registrarseEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar que el evento existe
    const evento = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    });

    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Verificar límite de participantes
    if (evento.maxParticipantes && evento._count.registrations >= evento.maxParticipantes) {
      return res.status(400).json({ message: 'Evento lleno' });
    }

    // Verificar si ya está registrado
    const registroExistente = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: parseInt(id)
        }
      }
    });

    if (registroExistente) {
      return res.status(400).json({ message: 'Ya estás registrado en este evento' });
    }

    // Crear registro
    await prisma.registration.create({
      data: {
        userId,
        eventId: parseInt(id)
      }
    });

    res.json({ message: 'Registrado exitosamente al evento' });
  } catch (error) {
    console.error('Error al registrarse:', error);
    res.status(500).json({ message: 'Error al registrarse al evento' });
  }
};

// Cancelar registro de evento
export const cancelarRegistro = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const registro = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: parseInt(id)
        }
      }
    });

    if (!registro) {
      return res.status(404).json({ message: 'No estás registrado en este evento' });
    }

    await prisma.registration.delete({
      where: {
        userId_eventId: {
          userId,
          eventId: parseInt(id)
        }
      }
    });

    res.json({ message: 'Registro cancelado exitosamente' });
  } catch (error) {
    console.error('Error al cancelar registro:', error);
    res.status(500).json({ message: 'Error al cancelar registro' });
  }
};

// Participar en evento (nuevo endpoint)
export const participarEnEvento = async (req, res) => {
  try {
    const { eventoId, eventoTitulo, eventoFecha, eventoUbicacion, participante } = req.body;

    // Validar datos requeridos
    if (!eventoId || !participante) {
      return res.status(400).json({ 
        message: 'Datos insuficientes. Se requiere eventoId y datos del participante.' 
      });
    }

    if (!participante.nombre || !participante.email || !participante.telefono) {
      return res.status(400).json({ 
        message: 'Los campos nombre, email y teléfono son obligatorios.' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(participante.email)) {
      return res.status(400).json({ 
        message: 'Formato de email inválido.' 
      });
    }

    // Verificar que el evento existe
    const evento = await prisma.event.findUnique({
      where: { id: parseInt(eventoId) },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            registrations: true
          }
        }
      }
    });

    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Verificar límite de participantes si está definido
    if (evento.maxParticipants && evento._count.registrations >= evento.maxParticipants) {
      return res.status(400).json({ 
        message: 'Lo sentimos, el evento ha alcanzado su capacidad máxima.' 
      });
    }

    // Verificar si el participante ya está registrado (por email)
    const registroExistente = await prisma.registration.findFirst({
      where: {
        eventId: parseInt(eventoId),
        // Como no tenemos sistema de autenticación completo para participantes,
        // verificamos por email en lugar de userId
        user: {
          email: participante.email
        }
      }
    });

    if (registroExistente) {
      return res.status(400).json({ 
        message: 'Este email ya está registrado para el evento.' 
      });
    }

    // Crear o buscar usuario para el participante
    let usuario = await prisma.user.findUnique({
      where: { email: participante.email }
    });

    if (!usuario) {
      // Crear usuario temporal para el participante
      usuario = await prisma.user.create({
        data: {
          name: participante.nombre,
          email: participante.email,
          password: 'temp_password', // Password temporal - en producción usar hash
          role: 'USER'
        }
      });
    }

    // Crear registro de participación
    const registro = await prisma.registration.create({
      data: {
        userId: usuario.id,
        eventId: parseInt(eventoId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            description: true
          }
        }
      }
    });

    // Preparar datos del evento para el correo
    const eventoParaCorreo = {
      title: evento.title || eventoTitulo,
      date: evento.date || eventoFecha,
      location: evento.location || eventoUbicacion,
      description: evento.description
    };

    // Enviar correo de confirmación
    const resultadoCorreo = await enviarCorreoConfirmacion(participante, eventoParaCorreo);

    console.log('✅ Participación registrada:', {
      participante: participante.nombre,
      evento: eventoParaCorreo.title,
      correo: resultadoCorreo.success ? 'enviado' : 'falló'
    });

    res.status(201).json({
      message: 'Participación registrada exitosamente',
      registro: {
        id: registro.id,
        participante: {
          nombre: participante.nombre,
          email: participante.email
        },
        evento: {
          id: eventoId,
          titulo: eventoParaCorreo.title,
          fecha: eventoParaCorreo.date
        }
      },
      correoEnviado: resultadoCorreo.success,
      messageId: resultadoCorreo.messageId
    });

  } catch (error) {
    console.error('❌ Error al procesar participación:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor al procesar la participación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};