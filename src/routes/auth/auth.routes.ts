// routes/auth.route.ts

import { Router } from 'express';
import AuthController from '@controllers/auth/auth.controller';
import { protect } from '@middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));

router.post('/forgotPassword', authController.forgotPassword.bind(authController));
router.patch('/resetPassword', authController.resetPassword.bind(authController));
router.post('/resendVerificationEmail', authController.resendVerificationEmail.bind(authController));
router.get('/verifyEmail/:token', authController.VerifyEmail.bind(authController));

router.use(protect);
router.post('/refresh', authController.refresh.bind(authController));
router.patch('/changePassword', authController.changePassword.bind(authController));
router.delete('/logout', authController.logout.bind(authController));

export default router;
