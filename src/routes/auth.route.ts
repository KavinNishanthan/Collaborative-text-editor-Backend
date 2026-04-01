// Importing packages
import { Router } from 'express';

// Importing controllers
import authController from '../controllers/auth.controller';

// Defining routers
const router = Router();

// Manual auth routes
router.post('/register', authController.handleRegisterAndSendOtp);
router.post('/verify/otp', authController.handleVerifyOtpAndRegister);

export default router;