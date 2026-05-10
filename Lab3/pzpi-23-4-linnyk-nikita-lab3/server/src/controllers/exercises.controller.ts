import {Request, Response, NextFunction} from 'express';
import * as exerciseService from '../services/exercises.service.js';
import {
    CreateExerciseInput, ExerciseProgressInput, UpdateExerciseInput
} from "../middlewares/validation/exerices.schema.js";

// Create a new exercise
export const createExercise = async (
    req: Request<{}, {}, CreateExerciseInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const reqBody = req.body;

        const newExercise = await exerciseService.createExercise(reqBody)

        res.status(200).json({
            message: 'Exercise created successfully.',
            exercise: newExercise,
        });
    } catch (err) {
        next(err)
    }
}

// Get exercises for a lesson
export const getExercises = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const lessonId = Number(req.params.id);

        const exercises = await exerciseService.getExercises(lessonId);

        res.status(200).json({
            message: 'Exercises fetched successfully.',
            exercises,
        })
    } catch (err) {
        next(err)
    }
}

// Record exercise progress
export const exerciseProgress = async (
    req: Request<{}, {}, ExerciseProgressInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const reqBody = req.body;

        const newExerciseProgress = await exerciseService.exerciseProgress(reqBody)

        res.status(201).json({
            message: 'Exercise progress recorded successfully.',
            exerciseProgress: newExerciseProgress,
        })
    } catch (err) {
        next(err)
    }
}

// Update exercise
export const updateExercise = async (
    req: Request<{ id: string }, {}, UpdateExerciseInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const exerciseId = Number(req.params.id);
        const reqBody = req.body;

        const updated = await exerciseService.updateExercise(
            {exerciseId, ...reqBody}
        );

        res.status(200).json({
            message: "Exercise updated successfully.",
            exercise: updated
        });
    } catch (err) {
        next(err);
    }
};

// Delete exercise
export const deleteExercise = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const exerciseId = Number(req.params.id);

        const deletedExercise = await exerciseService.deleteExercise(exerciseId);

        res.status(200).json({
            message: "Exercise deleted successfully.",
            deletedExercise
        });
    } catch (err) {
        next(err);
    }
};

export const submitExercise = async (
    req: Request<{id: string}, {}, {answer: string}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        const exerciseId = Number(req.params.id);
        const userAnswer = req.body.answer;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const submittedExercise = await exerciseService
            .submitExercise(userId, exerciseId, userAnswer);

        res.status(200).json({
            message: "Exercise submitted successfully.",
            submittedExercise
        });
    } catch (err) {
        next(err);
    }
}


