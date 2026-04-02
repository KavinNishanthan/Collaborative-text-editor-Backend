// Importing packages
import { Router } from 'express';

// Importing controllers
import activityController from '../controllers/activity.controller';

// Importing middleware
import authMiddleware from '../middlewares/auth.middleware';


const router = Router();

router.use(authMiddleware);

// Routes for document activity log
router.get('/:documentId/activity', activityController.handleGetActivityLog);

export default router;
