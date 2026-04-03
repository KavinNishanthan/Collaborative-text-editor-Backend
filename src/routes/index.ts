// Importing packages
import { Router } from 'express';

// Importing routes
import authRoute from './auth.route';
import documentRoute from './document.route';
import memberRoute from './member.route';
import invitationRoute from './invitation.route';
import historyRoute from './history.route';
import sharingRoute from './sharing.route';
import activityRoute from './activity.route';
import commentRoute from './comment.route';


// Defining router
const router = Router();
 
// Non authorization routes
router.use('/auth', authRoute);


// authorization routes
router.use('/documents', documentRoute);
router.use('/documents', memberRoute);
router.use('/documents', historyRoute);
router.use('/documents', sharingRoute);
router.use('/documents', activityRoute);
router.use('/documents', commentRoute);

// Invitation inbox routes
router.use('/invitations', invitationRoute);

export default router;