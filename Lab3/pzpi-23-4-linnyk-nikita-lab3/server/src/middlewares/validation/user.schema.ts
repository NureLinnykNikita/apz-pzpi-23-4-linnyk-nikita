import {z} from "zod";
import {lengthError} from "../../utils/errorMessages";


export const updateProfileSchema = z.object({
    username: z.string()
        .min(3, lengthError("username", "min", 3))
        .max(50, lengthError("username", "max", 50))
        .trim()
        .optional(),
    email: z.string().email().optional(),
    bio: z.string()
        .max(300, lengthError("bio", "max", 300))
        .optional(),
    avatarUrl: z.url().optional(),
    nativeLanguageId: z.number().positive().optional(),
})
.refine(data => {
    return Object.values(data).some(val => val !== undefined);
}, {
    message: "At least one field must be provided"
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const onboardingSchema = z.object({
    nativeLanguageId: z.number().int().positive(),
    dailyGoalExercises: z.number().int().min(1).max(100).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const updateSettingsSchema = z.object({
    dailyGoalExercises: z.number().int().min(1).max(100).optional(),
    notificationsEnabled: z.boolean().optional(),
    reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    timezone: z.string().min(1).max(50).optional(),
}).refine(data => Object.values(data).some(v => v !== undefined), {
    message: 'At least one field must be provided',
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
