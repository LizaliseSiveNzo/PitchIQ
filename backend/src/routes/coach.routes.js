import { Router } from 'express';
import * as ctrl from '../controllers/coach.controller.js';

const router = Router();
router.post('/training-session', ctrl.logTrainingSession);
router.post('/match-log', ctrl.logMatch);
router.patch('/player/:id/notes', ctrl.upsertPlayerNotes);
router.patch('/player/:id/bench', ctrl.benchPlayer);
router.get('/squad/:team_id', ctrl.getSquad);
export default router;
