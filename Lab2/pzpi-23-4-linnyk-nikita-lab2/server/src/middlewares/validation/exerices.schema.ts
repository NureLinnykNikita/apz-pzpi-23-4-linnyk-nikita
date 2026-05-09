import {z} from 'zod';
import {ExerciseType} from "../../../generated/prisma/enums.js";
import {lengthError} from "../../utils/errorMessages.js";

export const createExerciseSchema = z.object({
    lessonId: z.number(),
    type: z.enum(ExerciseType),
    question: z.string()
        .min(3, {error: lengthError("question", "min", 3)})
        .max(500, {error: lengthError("question", "max", 500)}),
    correctAnswer: z.string(),
    mediaUrl: z.string().nullish(),
    points: z.number().optional().default(1),
    sequence: z.number().optional(),
    metadata: z.record(z.string(), z.any()).optional().default({}),
});

export const exerciseProgressSchema = z.object({
    userId: z.uuid(),
    exerciseId: z.number(),
    isCorrect: z.boolean(),
    userAnswer: z.string(),
    earnedPoints: z.number(),
    attemptNumber: z.number()
})

export const updateExerciseSchema =
    createExerciseSchema
        .partial()
        .refine(data => Object.keys(data).length > 0,
            {message: "At least one field must be updated."}
        );

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type ExerciseProgressInput = z.infer<typeof exerciseProgressSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;