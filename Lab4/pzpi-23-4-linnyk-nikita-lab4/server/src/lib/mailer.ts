import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

const isDev = ENV.NODE_ENV !== 'production';

const transporter = isDev
    ? null
    : nodemailer.createTransport({
          host: ENV.MAIL_HOST,
          port: Number(ENV.MAIL_PORT),
          secure: Number(ENV.MAIL_PORT) === 465,
          auth: { user: ENV.MAIL_USER, pass: ENV.MAIL_PASS },
      });

export const sendPasswordResetEmail = async (to: string, code: string) => {
    if (isDev || !transporter) {
        console.log(`[DEV] Password reset code for ${to}: ${code}`);
        return;
    }

    await transporter.sendMail({
        from: ENV.MAIL_FROM,
        to,
        subject: 'LangBang — password reset code',
        text: `Your password reset code is: ${code}\n\nThis code expires in 15 minutes.`,
        html: `<p>Your password reset code is: <strong>${code}</strong></p><p>This code expires in 15 minutes.</p>`,
    });
};
