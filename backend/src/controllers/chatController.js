import { processChat, getConversationHistory } from '../services/chatService.js';
import prisma from '../config/db.js';

export async function sendMessage(req, res) {
  try {
    const { conversationId, message, organizationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!organizationId) {
      return res.status(400).json({ error: 'organizationId is required' });
    }

    const result = await processChat({
      conversationId: conversationId || null,
      message: message.trim(),
      organizationId,
    });

    res.json(result);

  } catch (error) {
    console.error('[Chat] Error:', error);
    
    // Check if the error from Gemini is a 429 Rate Limit
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      return res.status(429).json({ 
        error: "The AI is currently processing too many requests. Please wait 60 seconds and try again." 
      });
    }

    // Generic fallback for actual backend crashes
    res.status(500).json({ error: error.message });
  }
}

export async function getHistory(req, res) {
  try {
    const { conversationId } = req.params;
    const messages = await getConversationHistory(conversationId);
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export async function getUserConversations(req, res) {
  try {
    const organizationId = req.organizationId;
    
    // Fetch all conversations for this user's organization
    const conversations = await prisma.conversation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        // Grab the very first thing the user asked to use as a title
        messages: {
          where: { role: 'user' },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
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