import {NextFunction, Request, Response} from 'express'
import {
    registerUser,
    loginUser,
    refreshAccessToken
} from '../services/auth.service.js'
import {
    RegisterInput,
    LoginInput
} from '../middlewares/validation/auth.schema.js'
import {ENV} from "../config/env.js";
import {hashToken} from "../utils/token.js";
import {prisma} from "../lib/prisma.js";

// Register a new user
export const register = async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const {username, email, password} = req.body;

        const newUser = await registerUser({username, email, password});

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (err) {
        next(err)
    }
}

// Log in a user
export const login = async (
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const {email, password} = req.body;

        const result = await loginUser(email, password);

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7
        })

        res.status(200).json({
            message: 'User logged in successfully',
            user: result.user,
            token: result.accessToken,
            refreshToken: result.refreshToken
        });
    } catch (err) {
        next(err)
    }
}

export const refresh = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refreshToken = req.cookies.refreshToken ?? req.body.refreshToken;

        const accessToken = await refreshAccessToken(refreshToken);

        res.json({accessToken});
    } catch (err) {
        next(err);
    }
}

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refreshToken = req.cookies.refreshToken ?? req.body.refreshToken;

        if (refreshToken) {
            await prisma.refreshToken.delete({where: {tokenHash: hashToken(refreshToken)}});
        }

        res.clearCookie('refreshToken');
        res.status(200).json({message: 'User logged out successfully'});
    } catch (err) {
        next(err);
    }
}