import {Router} from 'express';
import {
    deleteUser,
    getMyProfile,
    updateUserRole,
    updateMyProfile,
    getMyStats,
    completeOnboarding,
    getSettings,
    updateSettings,
    getMyEnrollments,
} from "../controllers/users.controller.js";
import {authenticateToken} from "../middlewares/auth.middleware.js";
import {requirePermission} from "../middlewares/permission.middleware.js";
import {validate} from "../middlewares/validation/validate.js";
import {onboardingSchema, updateSettingsSchema} from "../middlewares/validation/user.schema.js";

const router = Router();

router.patch('/admin/users/:id', authenticateToken,
    requirePermission('manage_user'), updateUserRole);

router.delete('/admin/users/:id', authenticateToken,
    requirePermission('delete_user'), deleteUser);

router.get('/users/me', authenticateToken, getMyProfile);
router.patch('/users/me', authenticateToken, updateMyProfile);
router.get('/users/me/stats', authenticateToken, getMyStats);
router.patch('/users/me/onboarding', authenticateToken, validate(onboardingSchema), completeOnboarding);
router.get('/users/me/settings', authenticateToken, getSettings);
router.patch('/users/me/settings', authenticateToken, validate(updateSettingsSchema), updateSettings);
router.get('/users/me/enrollments', authenticateToken, getMyEnrollments);

export default router;

