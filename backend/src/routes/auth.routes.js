import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';

const router = Router();
router.post('/register', ctrl.register);      // role selection: admin|coach|parent|player
router.post('/login', ctrl.login);            // returns Supabase session
router.post('/invite-coach', ctrl.inviteCoach); // admin emails an invite link
router.post('/link-child', ctrl.linkChild);     // parent links via unique child_code
export default router;
