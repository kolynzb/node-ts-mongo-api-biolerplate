// routes/auth.route.ts

import { Router } from 'express';
import AuthController from '@controllers/auth/auth.controller';
import { protect } from '@middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));

router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.patch('/reset-password', authController.resetPassword.bind(authController));
router.post('/resend-verification-email', authController.resendVerificationEmail.bind(authController));
router.get('/verify-email/:token', authController.VerifyEmail.bind(authController));

router.use(protect);
router.post('/refresh', authController.refresh.bind(authController));
router.patch('/change-password', authController.changePassword.bind(authController));
router.delete('/logout', authController.logout.bind(authController));

export default router;
