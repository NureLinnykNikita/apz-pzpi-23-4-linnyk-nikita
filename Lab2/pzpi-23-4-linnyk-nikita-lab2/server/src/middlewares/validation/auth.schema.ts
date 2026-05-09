import {z} from 'zod';
import {lengthError} from "../../utils/errorMessages.js";

export const registerSchema = z.object({
    username: z.string().trim()
        .min(3, {error: lengthError("username", "min", 3)})
        .max(50, {error: lengthError("username", "max", 50)}),
    email: z.email(),
    password: z.string()
        .min(8, {error: lengthError("password", "min", 8)})
        .max(50, {error: lengthError("password", "max", 8)})
})

export const loginSchema = z.object({
    email: z.email(),
    password: z.string()
        .min(8, {error: lengthError("password", "min", 8)})
        .max(50, {error: lengthError("password", "max", 50)})
})

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;