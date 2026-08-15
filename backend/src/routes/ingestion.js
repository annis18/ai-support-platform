import express from 'express';
import { upload } from '../middleware/upload.js';
import { uploadDocument, getDocuments } from '../controllers/ingestionController.js';

const router = express.Router();

// No auth middleware on these routes during development
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/documents', getDocuments);

export default router;