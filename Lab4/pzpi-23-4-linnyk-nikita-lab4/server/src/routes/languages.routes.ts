import { Router } from 'express';
import {
    addLanguage,
    getLanguages,
    grantLanguageToUser,
    getUserLanguages,
    updateLanguage,
    deleteLanguage
} from '../controllers/languages.controller.js';
import {authenticateToken} from "../middlewares/auth.middleware.js";
import {requirePermission} from "../middlewares/permission.middleware.js";
import {validate} from "../middlewares/validation/validate.js";
import {
    createLanguageSchema, updateLanguageSchema
} from "../middlewares/validation/language.schema.js";

const router = Router();

router.get('/languages', getLanguages);
router.get('/users/:userId/languages', authenticateToken, getUserLanguages);
router.post('/languages', authenticateToken,
    requirePermission('manage_language'), validate(createLanguageSchema), addLanguage);
router.post('/users/:userId/languages/:languageId', authenticateToken,
    requirePermission('manage_language'), grantLanguageToUser);
router.patch('/languages/:id', authenticateToken,
    requirePermission('manage_language'), validate(updateLanguageSchema), updateLanguage);
router.delete('/languages/:id', authenticateToken,
    requirePermission('manage_language'), deleteLanguage);

export default router;