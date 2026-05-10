import {z} from "zod";
import {CourseLevel} from "../../../generated/prisma/enums.js";
import {lengthError} from "../../utils/errorMessages.js";

export const createCourseSchema = z.object({
    title: z.string()
        .min(3, {error: lengthError("title", "min", 3)})
        .max(50, {error: lengthError("title", "max", 50)}),
    description: z.string()
        .min(10, {error: lengthError("description", "min", 10)})
        .max(500, {error: lengthError("description", "max", 500)}),
    level: z.enum(CourseLevel),
    languageCode: z.string()
        .min(2, {error: lengthError("languageCode", "min", 2)})
});

export const enrollCourseSchema = z.object({
    courseId: z.number()
})

export const updateCourseSchema =
    createCourseSchema
        .partial()
        .refine(data => Object.keys(data).length > 0,
            {message: "At least one field must be updated."}
        );

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type EnrollCourseInput = z.infer<typeof enrollCourseSchema>;