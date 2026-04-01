// Importing packages
import { Router } from 'express';

// Importing routes
import authRoute from './auth.route';


// Defining router
const router = Router();
 
// Non authorization routes
router.use('/auth', authRoute);

export default router;