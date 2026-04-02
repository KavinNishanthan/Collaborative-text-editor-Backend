// Importing packages
import { Router } from 'express';

// Importing controllers
import documentController from '../controllers/document.controller';

// Importing middleware
import authMiddleware from '../middlewares/auth.middleware';

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description Routes for document CRUD operations
 */

const router = Router();

router.use(authMiddleware);

router.post('/', documentController.handleCreateDocument);


export default router;
