import GoogleAuthController from '@controllers/auth/google-auth.controller';
import { Router } from 'express';

const router = Router();
const googleAuthController = new GoogleAuthController();

router.get('/url', googleAuthController.googleAuthUrl);

// Callback route for Google OAuth
router.get('/callback', googleAuthController.googleAuthCallback);

export default router;
