import { Router } from 'express';
import {createLesson, getLessons,
    updateLesson, deleteLesson} from "../controllers/lessons.controller.js";
import {authenticateToken} from "../middlewares/auth.middleware.js";
import {requirePermission} from "../middlewares/permission.middleware.js";
import {
    createLessonSchema,
    updateLessonSchema
} from "../middlewares/validation/lesson.schema.js";
import {validate} from "../middlewares/validation/validate.js";

const router = Router();

router.post('/lessons', authenticateToken,
    requirePermission('manage_lesson'), validate(createLessonSchema), createLesson)
router.get('/courses/:id/lessons', authenticateToken, getLessons)
router.patch('/lessons/:id', authenticateToken,
    requirePermission('manage_lesson'), validate(updateLessonSchema), updateLesson);
router.delete('/lessons/:id', authenticateToken,
    requirePermission('manage_lesson'), deleteLesson);

export default router;