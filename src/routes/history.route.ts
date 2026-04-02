// Importing packages
import { Router } from 'express';

// Importing controllers
import historyController from '../controllers/history.controller';

// Importing middleware
import authMiddleware from '../middlewares/auth.middleware';


const router = Router();

router.use(authMiddleware);

// Routes for document version history
router.get('/:documentId/history', historyController.handleGetHistory);
router.post('/:documentId/history/:historyId/restore', historyController.handleRestoreVersion);

export default router;
