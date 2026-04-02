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
router.get('/:documentId/members', memberController.handleGetAllMembers);
router.put('/:documentId/members/:memberId', memberController.handleUpdateMemberRole);
router.delete('/:documentId/members/:memberId', memberController.handleRemoveMember);

export default router;
