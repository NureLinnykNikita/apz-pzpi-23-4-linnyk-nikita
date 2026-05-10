import { Router } from 'express';
import {createConversation, sendMessage, getMessages} from "../controllers/chat.controller.js";
import {authenticateToken} from "../middlewares/auth.middleware.js";
import {requirePermission} from "../middlewares/permission.middleware.js";
import {deleteMessage} from "../controllers/chat.controller.js";

const router = Router();

router.post('/conversations', authenticateToken, createConversation);

router.post('/conversations/:conversationId/messages', authenticateToken, sendMessage);

router.get('/conversations/:conversationId/messages', authenticateToken, getMessages);

router.delete('/conversations/:conversationId/messages/:messageId', authenticateToken,
    requirePermission('moderate_chat'), deleteMessage);

export default router;