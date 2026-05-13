import {z} from 'zod';
import {lengthError} from "../../utils/errorMessages";

const createAchievementSchema = z.object({
    code: z.string()
        .min(5, {message: lengthError("code", "min", 5)})
        .max(50, {message: lengthError("code", "max", 50)}),
    title: z.string()
        .min(5, {message: lengthError("title", "min", 5)})
        .max(50, {message: lengthError("title", "max", 100)}),
    description: z.string()
        .min(10, {message: lengthError("description", "min", 10)})
        .max(500, {message: lengthError("description", "max", 500)}),
    category: z.string()
        .min(5, {message: lengthError("title", "min", 5)})
        .max(50, {message: lengthError("title", "max", 100)})
        .nullish(),
    iconUrl: z.string().nullish(),
    conditionType: z.string()
        .min(5, {message: lengthError("conditionType", "min", 5)})
        .max(50, {message: lengthError("conditionType", "max", 100)}),
    conditionValue: z.number().nullish()
});

const updateAchievementSchema = createAchievementSchema
    .partial()
    .refine(data => Object.keys(data).length > 0,
        {message: "At least one field must be updated."})
;

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;