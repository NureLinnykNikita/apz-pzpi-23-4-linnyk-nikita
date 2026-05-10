import { Router } from 'express';
import {getAllCourses, createCourse, enrollForCourse,
    updateCourse, deleteCourse, getCourseProgress, unenrollFromCourse} from "../controllers/courses.controller.js";
import {authenticateToken} from "../middlewares/auth.middleware.js";
import {requirePermission} from "../middlewares/permission.middleware.js";
import {
    createCourseSchema, enrollCourseSchema,
    updateCourseSchema
} from "../middlewares/validation/course.schema.js";
import {validate} from "../middlewares/validation/validate.js";

const router = Router();

router.get('/', getAllCourses);
router.post('/', authenticateToken, requirePermission('manage_course'),
    validate(createCourseSchema), createCourse);
router.post('/enrollments', authenticateToken, validate(enrollCourseSchema), enrollForCourse);
router.get('/:courseId/progress', authenticateToken, getCourseProgress)
router.delete('/enrollments/:courseId', authenticateToken, unenrollFromCourse)
router.patch('/:courseId', authenticateToken,
    requirePermission('manage_course'), validate(updateCourseSchema), updateCourse);
router.delete('/:courseId', authenticateToken,
    requirePermission('manage_course'), deleteCourse);

export default router;