// Importing packages
import { Router } from 'express';

// Importing controllers
import authController from '../controllers/auth.controller';

// Defining routers
const router = Router();

// Manual Register routes
router.post('/register', authController.handleRegisterAndSendOtp);
router.post('/verify/otp', authController.handleVerifyOtpAndRegister);

// Manual Login routes
router.get('/login', authController.handleLogin);

export default router;