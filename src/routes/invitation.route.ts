// Importing packages
import { Router } from 'express';

// Importing middleware
import authMiddleware from '../middlewares/auth.middleware';

// Importing controllers
import invitationController from '../controllers/invitation.controller';


const router = Router();

router.use(authMiddleware);

// Invitation routes 
router.get('/', invitationController.handleGetPendingInvitations);

router.post('/:invitationId/accept', invitationController.handleAcceptInvitation);

router.post('/:invitationId/decline', invitationController.handleDeclineInvitation);

export default router;
