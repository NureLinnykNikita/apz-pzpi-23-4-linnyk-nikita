import {z} from "zod";
import {lengthError} from "../../utils/errorMessages.js";

export const createLanguageSchema = z.object({
    code: z.string().min(2, {message: lengthError("code", "min", 2)}),
    name: z.string()
        .min(3, {message: lengthError("name", "min", 3)})
        .max(50, {message: lengthError("name", "max", 50)})
})

export const updateLanguageSchema = createLanguageSchema
    .partial()
    .refine(data => Object.keys(data).length > 0,
        {message: "At least one field must be updated."}
    );

export type CreateLanguageInput = z.infer<typeof createLanguageSchema>;
export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;