import { Router } from 'express';
import * as ctrl from '../controllers/parent.controller.js';

const router = Router();
router.get('/child', ctrl.getChildOverview);   // stats, comments, fixtures, bench reason, diet
export default router;
