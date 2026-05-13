import { Router } from 'express';
import { getAdminUsers, getAdminStats, exportData, importData } from '../controllers/admin.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.get('/admin/users', authenticateToken, requirePermission('manage_user'), getAdminUsers);
router.get('/admin/stats', authenticateToken, requirePermission('manage_user'), getAdminStats);
router.get('/admin/export', authenticateToken, requirePermission('manage_user'), exportData);
router.post('/admin/import', authenticateToken, requirePermission('manage_user'), importData);

export default router;
