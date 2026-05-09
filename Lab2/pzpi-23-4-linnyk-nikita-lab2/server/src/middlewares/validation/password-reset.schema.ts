import { z } from 'zod';

export const requestResetSchema = z.object({
    email: z.string().email(),
});

export const verifyResetCodeSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6).regex(/^\d+$/),
});

export const confirmResetSchema = z.object({
    resetToken: z.string().min(1),
    newPassword: z.string().min(8).max(50),
});

export type RequestResetInput = z.infer<typeof requestResetSchema>;
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;
export type ConfirmResetInput = z.infer<typeof confirmResetSchema>;
