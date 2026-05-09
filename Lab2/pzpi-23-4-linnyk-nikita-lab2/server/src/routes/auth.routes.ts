import express from 'express';
import {
    register,
    login,
    refresh,
    logout
} from '../controllers/auth.controller.js';
import {validate} from "../middlewares/validation/validate.js";
import {registerSchema, loginSchema} from "../middlewares/validation/auth.schema.js";
import {authenticateToken} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Auth endpoints
router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/logout', authenticateToken, logout)
router.post('/refresh', refresh)

export default router;
