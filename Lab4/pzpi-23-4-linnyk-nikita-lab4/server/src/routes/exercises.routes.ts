import express from 'express';
import {getExercises, createExercise, exerciseProgress,
    updateExercise, deleteExercise, submitExercise} from "../controllers/exercises.controller.js";
import {authenticateToken} from "../middlewares/auth.middleware.js";
import {requirePermission} from "../middlewares/permission.middleware.js";
import {
    createExerciseSchema, exerciseProgressSchema, updateExerciseSchema
} from "../middlewares/validation/exerices.schema.js";
import {validate} from "../middlewares/validation/validate.js";

const router = express.Router();

router.post('/exercises', authenticateToken,
    requirePermission('manage_exercise'), validate(createExerciseSchema), createExercise);
router.get('/lessons/:id/exercises', authenticateToken, getExercises);
router.post('/exercises/progress', authenticateToken, validate(exerciseProgressSchema), exerciseProgress);
router.post('/exercises/:id/submit', authenticateToken, submitExercise)
router.patch('/exercises/:id', authenticateToken,
    requirePermission('manage_exercise'), validate(updateExerciseSchema), updateExercise);
router.delete('/exercises/:id', authenticateToken,
    requirePermission('manage_exercise'), deleteExercise);

export default router;