import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { hashToken } from '../utils/token.js';
import { ENV } from '../config/env.js';
import { sendPasswordResetEmail } from '../lib/mailer.js';
import { UnauthorizedError } from '../errors/index.js';
import { hashPassword } from '../utils/password.js';

const OTP_TTL_MS = 15 * 60 * 1000;

const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

export const requestPasswordReset = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { userId: true },
    });

    if (!user) return;

    await prisma.passwordResetToken.deleteMany({
        where: { userId: user.userId, usedAt: null },
    });

    const otp = generateOtp();
    const tokenHash = hashToken(otp);

    await prisma.passwordResetToken.create({
        data: {
            tokenHash,
            userId: user.userId,
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
        },
    });

    await sendPasswordResetEmail(email, otp);
};

export const verifyResetCode = async (email: string, code: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { userId: true },
    });

    if (!user) throw new UnauthorizedError('Invalid code');

    const tokenHash = hashToken(code);
    const record = await prisma.passwordResetToken.findFirst({
        where: {
            userId: user.userId,
            tokenHash,
            usedAt: null,
            expiresAt: { gt: new Date() },
        },
    });

    if (!record) throw new UnauthorizedError('Invalid or expired code');

    const resetToken = jwt.sign(
        { userId: user.userId, purpose: 'password_reset' },
        ENV.JWT_ACCESS_SECRET,
        { expiresIn: '10m' }
    );

    return { resetToken };
};

export const confirmPasswordReset = async (
    resetToken: string,
    newPassword: string
) => {
    let payload: { userId: string; purpose: string };

    try {
        payload = jwt.verify(resetToken, ENV.JWT_ACCESS_SECRET) as typeof payload;
    } catch {
        throw new UnauthorizedError('Invalid or expired reset token');
    }

    if (payload.purpose !== 'password_reset') {
        throw new UnauthorizedError('Invalid reset token');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
        await tx.passwordResetToken.updateMany({
            where: { userId: payload.userId, usedAt: null },
            data: { usedAt: new Date() },
        });

        await tx.user.update({
            where: { userId: payload.userId },
            data: {
                passwordHash,
                tokenVersion: { increment: 1 },
            },
        });
    });
};
