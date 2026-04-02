// Importing packages
import { Router } from 'express';

// Importing controllers
import documentController from '../controllers/document.controller';

// Importing middleware
import authMiddleware from '../middlewares/auth.middleware';


const router = Router();

router.use(authMiddleware);


// Doc Route
router.post('/', documentController.handleCreateDocument);
router.get('/', documentController.handleGetAllDocuments);
router.get('/:documentId', documentController.handleGetDocumentById);
router.put('/:documentId', documentController.handleUpdateDocument);


export default router;
