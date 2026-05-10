import 'dotenv/config';

const required = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`${key} not defined.`);
    }
    return value;
}

export const ENV = {
    PORT: required('PORT'),
    JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
    JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
    DATABASE_URL: required('DATABASE_URL'),
    NODE_ENV: required('NODE_ENV') || 'development',
    CLOUDINARY_CLOUD_NAME: required('CLOUDINARY_CLOUD_NAME'),
    CLOUDINARY_API_KEY: required('CLOUDINARY_API_KEY'),
    CLOUDINARY_API_SECRET: required('CLOUDINARY_API_SECRET'),
    MAIL_HOST: process.env['MAIL_HOST'] ?? '',
    MAIL_PORT: process.env['MAIL_PORT'] ?? '587',
    MAIL_USER: process.env['MAIL_USER'] ?? '',
    MAIL_PASS: process.env['MAIL_PASS'] ?? '',
    MAIL_FROM: process.env['MAIL_FROM'] ?? 'noreply@langbang.app',
}