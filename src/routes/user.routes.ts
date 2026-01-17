import { Router } from 'express';

import authMiddleware from '../middleware/auth.middleware';
import {
    validateUpdateProfile,
    validateChangePassword
} from '../validators/auth.validator';

const router: Router = Router();

router.post('/change-password', authMiddleware, validateChangePassword);

export default router;