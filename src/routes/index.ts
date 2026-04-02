// Importing packages
import { Router } from 'express';

// Importing routes
import authRoute from './auth.route';
import documentRoute from './document.route';


// Defining router
const router = Router();
 
// Non authorization routes
router.use('/auth', authRoute);


// authorization routes
router.use('/documents', documentRoute);

export default router;