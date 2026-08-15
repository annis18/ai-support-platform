import { processChat, getConversationHistory } from '../services/chatService.js';

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