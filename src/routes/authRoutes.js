import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', authenticateToken, getProfile);

export default router;