import express from 'express';
import { upload } from '../middleware/upload.js';
import { uploadDocument, getDocuments, deleteDocument} from '../controllers/ingestionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// requireAuth goes right after the route path
router.post('/upload', requireAuth, upload.single('file'), uploadDocument);
router.get('/documents', requireAuth, getDocuments);
router.delete('/documents/:id', requireAuth, deleteDocument);
export default router;