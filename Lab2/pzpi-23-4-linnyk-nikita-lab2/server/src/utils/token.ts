import jwt from "jsonwebtoken";
import {ENV} from "../config/env.js";
import crypto from "crypto";

type JwtRefreshTokenPayload = {
    userId: string;
}

type JwtAccessTokenPayload = {
    userId: string;
    role: string;
    permissions: string[];
    tokenVersion: number;
}

export const generateRefreshToken = (payload: JwtRefreshTokenPayload) => {
    return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {expiresIn: '7d'});
}

export const generateAccessToken = (payload: JwtAccessTokenPayload) => {
    return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {expiresIn: '15m'});
}

export const hashToken = (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}