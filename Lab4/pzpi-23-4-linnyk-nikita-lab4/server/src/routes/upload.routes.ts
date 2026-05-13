import { Router } from 'express';
import {authenticateToken} from "../middlewares/auth.middleware";
import {uploadMiddleware} from "../middlewares/upload.middleware";
import {uploadFile} from "../controllers/upload.controller";

const router = Router();

router.post('/upload', authenticateToken, uploadMiddleware.single('file'), uploadFile);

export default router;