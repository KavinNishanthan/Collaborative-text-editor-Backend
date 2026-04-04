// Importing packages
import { Router } from 'express';

// Importing controllers
import authController from '../controllers/auth.controller';

// Importing middleware
import authMiddleware from '../middlewares/auth.middleware';

// Defining routers
const router = Router();

// Manual Register routes
router.post('/register', authController.handleRegisterAndSendOtp);
router.post('/verify/otp', authController.handleVerifyOtpAndRegister);

// Manual Login routes
router.post('/login', authController.handleLogin);


// Google OAuth routes
router.get('/google', authController.handleGoogleRedirect);
router.get('/google/callback', authController.handleGoogleCallback);

router.post('/logout', authMiddleware, (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.status(200).json({ status: 'Ok', code: 200, message: 'Logged out successfully!' });
});

export default router;