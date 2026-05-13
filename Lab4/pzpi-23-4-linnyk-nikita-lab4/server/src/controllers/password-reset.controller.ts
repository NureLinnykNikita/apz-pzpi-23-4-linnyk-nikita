import { NextFunction, Request, Response } from 'express';
import {
    requestPasswordReset,
    verifyResetCode,
    confirmPasswordReset,
} from '../services/password-reset.service.js';
import {
    RequestResetInput,
    VerifyResetCodeInput,
    ConfirmResetInput,
} from '../middlewares/validation/password-reset.schema.js';

export const requestReset = async (
    req: Request<{}, {}, RequestResetInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        await requestPasswordReset(req.body.email);
        res.json({ message: 'If that email exists, a reset code has been sent' });
    } catch (err) {
        next(err);
    }
};

export const verifyCode = async (
    req: Request<{}, {}, VerifyResetCodeInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await verifyResetCode(req.body.email, req.body.code);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const confirmReset = async (
    req: Request<{}, {}, ConfirmResetInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        await confirmPasswordReset(req.body.resetToken, req.body.newPassword);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
};
