import express from 'express';
import { sendMessage, getHistory, getUserConversations, getConversationMessages} from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Add requireAuth before your controller functions
router.post('/message', requireAuth, sendMessage);
router.get('/:id/history', requireAuth, getHistory);
router.get('/conversations', requireAuth, getUserConversations);
router.get('/conversations/:id', requireAuth, getConversationMessages);
export default router;