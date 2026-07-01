import { Router } from 'express';
import * as ctrl from '../controllers/trial.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
// Public (no login) — QR check-in
router.get('/:qr_token', ctrl.getTrialByToken);
router.post('/:qr_token/register', ctrl.registerTrialist);
// Staff
router.post('/', authenticate, requireRole('admin'), ctrl.createTrial);
router.get('/:id/registrations', authenticate, requireRole('admin', 'coach'), ctrl.listRegistrations);
router.patch('/registration/:id/outcome', authenticate, requireRole('admin', 'coach'), ctrl.setOutcome);
export default router;
