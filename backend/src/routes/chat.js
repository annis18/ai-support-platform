import express from 'express';
import { sendMessage, getHistory } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat/message  → send a message, get an AI answer
router.post('/message', sendMessage);

// GET  /api/chat/:conversationId/history  → fetch conversation history
router.get('/:conversationId/history', getHistory);

export default router;