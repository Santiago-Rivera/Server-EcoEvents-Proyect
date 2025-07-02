import { Router } from 'express';
import { 
  getEventos, 
  getEventoById, 
  createEvento, 
  updateEvento, 
  deleteEvento, 
  registrarseEvento, 
  cancelarRegistro,
  participarEnEvento 
} from '../controllers/eventController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = Router();

// Rutas públicas
router.get('/', getEventos);

// Nueva ruta para participación con correo (sin autenticación requerida)
router.post('/participar', participarEnEvento);

router.get('/:id', getEventoById);

// Ruta temporal sin autenticación para pruebas
router.post('/', createEvento);

// Rutas protegidas - requieren autenticación
// router.post('/', authenticateToken, createEvento);  // Comentado temporalmente
router.put('/:id', authenticateToken, updateEvento);
router.delete('/:id', authenticateToken, deleteEvento);

// Rutas de registro a eventos
router.post('/:id/register', authenticateToken, registrarseEvento);
router.delete('/:id/register', authenticateToken, cancelarRegistro);

export default router;