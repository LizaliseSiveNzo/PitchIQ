import { Router } from 'express';
import * as ctrl from '../controllers/admin.controller.js';

const router = Router();
router.get('/teams', ctrl.listTeams);
router.post('/teams', ctrl.createTeam);
router.get('/players', ctrl.listAllPlayers);
router.get('/reports/export', ctrl.exportReports);
router.post('/sport', ctrl.addSport);           // multi-sport expansion
export default router;
