// Importing packages
import { Router } from 'express';

// Importing controllers
import commentController from '../controllers/comment.controller';

// Importing middleware
import authMiddleware from '../middlewares/auth.middleware';


const router = Router();

router.use(authMiddleware);

router.post('/:documentId/comments', commentController.handleAddComment);
router.get('/:documentId/comments', commentController.handleGetComments);
router.post('/:documentId/comments/:commentId/reply', commentController.handleReplyToComment);
router.put('/:documentId/comments/:commentId/resolve', commentController.handleResolveComment);

export default router;
