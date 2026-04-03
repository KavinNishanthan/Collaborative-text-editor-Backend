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
router.get('/login', authController.handleLogin);

router.post('/logout', authMiddleware, (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'strict' });
  res.status(200).json({ status: 'Ok', code: 200, message: 'Logged out successfully!' });
});

export default router;