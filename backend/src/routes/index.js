import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import coachRoutes from './coach.routes.js';
import parentRoutes from './parent.routes.js';
import playerRoutes from './player.routes.js';
import trialRoutes from './trial.routes.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/trials', trialRoutes); // public QR registration lives here

// Protected areas
router.use('/admin',  authenticate, requireRole('admin'), adminRoutes);
router.use('/coach',  authenticate, requireRole('coach', 'admin'), coachRoutes);
router.use('/parent', authenticate, requireRole('parent'), parentRoutes);
router.use('/player', authenticate, requireRole('player', 'admin'), playerRoutes);

export default router;
