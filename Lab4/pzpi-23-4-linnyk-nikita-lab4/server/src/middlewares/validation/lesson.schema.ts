import {z} from 'zod';
import {lengthError} from "../../utils/errorMessages.js";

export const createLessonSchema = z.object({
    courseId: z.number(),
    title: z.string()
        .min(3, lengthError("title", "min", 3))
        .max(50, lengthError("title", "max", 50)),
    description: z.string()
        .min(10, lengthError("description", "min", 10))
        .max(500, lengthError("description", "max", 500)),
    sequence: z.number().optional()
});

export const updateLessonSchema =
    createLessonSchema
        .partial()
        .refine(data => Object.keys(data).length > 0,
            {message: "At least one field must be updated."}
        );

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;