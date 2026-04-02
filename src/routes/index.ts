// Importing packages
import { Router } from 'express';

// Importing routes
import authRoute from './auth.route';
import documentRoute from './document.route';
import memberRoute from './member.route';
import invitationRoute from './invitation.route';


// Defining router
const router = Router();
 
// Non authorization routes
router.use('/auth', authRoute);


// authorization routes
router.use('/documents', documentRoute);
router.use('/documents', memberRoute);

// Invitation inbox routes
router.use('/invitations', invitationRoute);

export default router;