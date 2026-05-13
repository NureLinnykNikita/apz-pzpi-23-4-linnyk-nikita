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

function setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        // 'strict' blocks cross-origin cookies; use 'lax' during local dev
        sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
}

// Register a new user — auto-login after registration
export const register = async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const {username, email, password} = req.body;

        // Create user
        await registerUser({username, email, password});

        // Auto-login to get tokens
        const result = await loginUser(email, password);

        setRefreshCookie(res, result.refreshToken);

        res.status(201).json({
            message: 'User created successfully',
            accessToken: result.accessToken,
            user: result.user,
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

        setRefreshCookie(res, result.refreshToken);

        res.status(200).json({
            message: 'User logged in successfully',
            accessToken: result.accessToken,
            user: result.user,
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
