import express from 'express';
import { requestReset, verifyCode, confirmReset } from '../controllers/password-reset.controller.js';
import { validate } from '../middlewares/validation/validate.js';
import {
    requestResetSchema,
    verifyResetCodeSchema,
    confirmResetSchema,
} from '../middlewares/validation/password-reset.schema.js';

const router = express.Router();

router.post('/request', validate(requestResetSchema), requestReset);
router.post('/verify', validate(verifyResetCodeSchema), verifyCode);
router.post('/confirm', validate(confirmResetSchema), confirmReset);

export default router;
