'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, Loader2, Bot, Paperclip } from 'lucide-react';
import { sendMessage, uploadDocument, getConversationMessages, Message, Source } from '@/lib/api';
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
  const [isUploading, setIsUploading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

 // --- FEATURE 1: RESTORE, WIPE, OR FETCH CHAT MEMORY ---
  useEffect(() => {
    const isNew = searchParams.get('new') === 'true';
    const loadId = searchParams.get('id');

    if (isNew) {
      // 1. User clicked "New Conversation" -> Wipe memory
      sessionStorage.removeItem('chatMessages');
      sessionStorage.removeItem('chatConversationId');
      setMessages([]);
      setConversationId(undefined);
      window.history.replaceState(null, '', '/?view=chat');
      
    } else if (loadId) {
      // 2. User clicked an old chat -> Fetch from backend
      async function fetchOldChat() {
        try {
          setLoading(true);
          const safeId = loadId as string; // <-- This single line fixes the TS errors!
          
          const data = await getConversationMessages(safeId);
          
          setMessages(data.messages);
          setConversationId(safeId);
          
          sessionStorage.setItem('chatConversationId', safeId);
          sessionStorage.setItem('chatMessages', JSON.stringify(data.messages));
        } catch (err) {
          console.error('Failed to load chat:', err);
        } finally {
          setLoading(false);
        }
      }
      
      fetchOldChat();
      window.history.replaceState(null, '', '/?view=chat');
      
    } else {
      // 3. User just switched tabs -> Restore from browser memory
      const savedMessages = sessionStorage.getItem('chatMessages');
      const savedId = sessionStorage.getItem('chatConversationId');
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      if (savedId) setConversationId(savedId);
    }
  }, [searchParams]);

  // Save to memory whenever the conversation updates
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      sessionStorage.setItem('chatConversationId', conversationId);
    }
  }, [conversationId]);
  // ----------------------------------------

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading || isUploading) return;

    // We add dummy IDs/Dates just to satisfy the TypeScript interface locally
    const userMessage: MessageWithSources = { 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(), 
      role: 'user', 
      content: trimmed 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(trimmed, organizationId, conversationId);
      if (!conversationId) setConversationId(response.conversationId);

      const assistantMessage: MessageWithSources = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), createdAt: new Date().toISOString(), role: 'assistant', content: `Error: ${message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // --- FEATURE 2: IN-CHAT PDF UPLOADS ---
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadDocument(file, organizationId);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          role: 'assistant',
          content: `✅ Successfully uploaded **${file.name}** to the knowledge base. You can now ask me questions about it!`,
        },
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), createdAt: new Date().toISOString(), role: 'assistant', content: `❌ Failed to upload ${file.name}: ${message}` },
      ]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
        {(loading || isUploading) && (
          <div className="flex items-start gap-2">
            <div className="bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 rounded-2xl flex items-center gap-3">
              <Loader2 size={16} className="text-indigo-400 animate-spin" />
              {isUploading && <span className="text-sm text-gray-400">Processing document...</span>}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-[#222]">
        <div className="flex gap-2 items-end">
          
          {/* New Merged Input Wrapper */}
          <div className="flex-1 flex items-center bg-[#1a1a1a] border border-[#333] focus-within:border-indigo-500 rounded-xl px-2 transition-colors">
            
            {/* Paperclip Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isUploading}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
              title="Upload document"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
            </button>
            <input
              type="file"
              accept=".pdf,.txt"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or attach a file..."
              rows={1}
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 py-3 px-2 text-sm resize-none focus:outline-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || isUploading}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors h-[46px] w-[46px] flex items-center justify-center shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}