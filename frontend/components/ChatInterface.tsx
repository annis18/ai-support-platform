'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot } from 'lucide-react';
import { sendMessage, setAuthToken, Message, Source } from '@/lib/api';
import ChatMessage from './ChatMessage';

interface MessageWithSources extends Message {
  sources?: Source[];
}

interface Props {
  organizationId: string;
}

export default function ChatInterface({ organizationId }: Props) {
  const [messages, setMessages] = useState<MessageWithSources[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: MessageWithSources = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(trimmed, organizationId, conversationId);
      if (!conversationId) setConversationId(response.conversationId);

      const assistantMessage: MessageWithSources = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center">
              <Bot size={24} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-gray-300 font-medium">AI Support Assistant</p>
              <p className="text-gray-500 text-sm mt-1">Ask questions about your documents</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} sources={msg.sources} />
          ))
        )}
        {loading && (
          <div className="flex items-start gap-2">
            <div className="bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 rounded-2xl">
              <Loader2 size={16} className="text-indigo-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-[#222]">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-[#1a1a1a] border border-[#333] text-gray-200 placeholder-gray-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}