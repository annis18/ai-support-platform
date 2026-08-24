import { processChat, getConversationHistory } from '../services/chatService.js';
import prisma from '../config/db.js';

export async function sendMessage(req, res) {
  try {
    const { conversationId, message, organizationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Fall back to user's organizationId from auth middleware if not passed in body
    const targetOrgId = organizationId || req.user?.organizationId || req.user?.id;

    if (!targetOrgId) {
      return res.status(400).json({ error: 'organizationId or valid authenticated user is required' });
    }

    const result = await processChat({
      conversationId: conversationId || null,
      message: message.trim(),
      organizationId: targetOrgId,
      userId: req.user?.id,
    });

    res.json(result);

  } catch (error) {
    console.error('[Chat] Error:', error);
    
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      return res.status(429).json({ 
        error: "The AI is currently processing too many requests. Please wait 60 seconds and try again." 
      });
    }

    res.status(500).json({ error: error.message });
  }
}

export async function getHistory(req, res) {
  try {
    // Route param is :id in chatRoutes.js
    const conversationId = req.params.id;
    const messages = await getConversationHistory(conversationId);
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserConversations(req, res) {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ conversations });
  } catch (error) {
    console.error('[Get Conversations Error]:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getConversationMessages(req, res) {
  try {
    const { id } = req.params;
    
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    });
    
    res.json({ messages });
  } catch (error) {
    console.error('[Get Messages Error]:', error);
    res.status(500).json({ error: error.message });
  }
}