// Importing packages
import { Router } from 'express';

// Importing controllers
import sharingController from '../controllers/sharing.controller';

// Importing middleware
import authMiddleware from '../middlewares/auth.middleware';


const router = Router();

router.use(authMiddleware);

// Routes for document sharing via link
router.post('/:documentId/share', sharingController.handleGenerateShareLink);
router.post('/join', sharingController.handleJoinViaShareLink);

export default router;
