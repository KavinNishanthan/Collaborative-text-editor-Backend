// Importing packages
import { Router } from 'express';

// Importing controllers
import memberController from '../controllers/member.controller';

// Importing middleware
import authMiddleware from '../middlewares/auth.middleware';


const router = Router();

router.use(authMiddleware);

// Routes for document member management
router.post('/:documentId/members/invite', memberController.handleInviteMember);

export default router;
