import { Router } from 'express';
import * as ctrl from '../controllers/player.controller.js';

const router = Router();
router.get('/me', ctrl.getMyProfile);          // profile, rank, history, fixtures
router.get('/me/ai-summary', ctrl.getAiSummary);
export default router;
