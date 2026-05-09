import {Router} from "express";
import {
    createAchievement,
    getUserAchievements, grantAchievementToUser,
    updateAchievement, deleteAchievement
} from "../controllers/achievements.controller.js";
import {authenticateToken} from "../middlewares/auth.middleware.js";
import {requirePermission} from "../middlewares/permission.middleware.js";

const router = Router();

router.post('/achievements', authenticateToken,
    requirePermission('manage_achievement'), createAchievement);
router.post('/users/:userId/achievements/:achievementId', authenticateToken,
    requirePermission('manage_achievement'), grantAchievementToUser);
router.get('/users/:userId/achievements', authenticateToken, getUserAchievements);
router.patch('/achievements/:id', authenticateToken,
    requirePermission('manage_achievement'), updateAchievement);
router.delete('/achievements/:id', authenticateToken,
    requirePermission('manage_achievement'), deleteAchievement);

export default router;