import { Router } from 'express';
import { leaderboard } from '../controllers/leaderboard.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/leaderboard', authenticateToken, leaderboard);

export default router;
