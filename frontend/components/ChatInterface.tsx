'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { sendMessage, setAuthToken, Message, Source } from '@/lib/api';
import ChatMessage from './ChatMessage';
import { Sparkles, ArrowUp, Loader2 } from 'lucide-react';

export default function ChatInterface({ organizationId }: { organizationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      const token = await getToken();
      setAuthToken(token);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await sendMessage(userMessage, organizationId, conversationId) as any;
      
      setConversationId(response.conversationId);
      setMessages([...newMessages, { role: 'assistant', content: response.reply }]);
      setSources(response.sources || []);
    } catch (err: unknown) {
      console.error('[Frontend Chat Error - Trace]:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (err as any)?.response?.data?.error || (err as Error).message || 'An unexpected error occurred.';
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: `Error: ${errorMessage}\n\n(If rate limited by Gemini, please wait 60 seconds and retry).` 
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
// ... keep the rest of the file exactly the same
    <div className="flex flex-col h-full bg-[#09090B] relative overflow-hidden">
      
      {/* Scrollable Chat History Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          
          {messages.length === 0 ? (
            /* Hero Empty State optimized for mobile */
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
              <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                <Sparkles size={22} className="text-[#FAFAFA]" />
              </div>
              <h2 className="text-[22px] md:text-[24px] font-semibold text-[#FAFAFA] tracking-tight mb-2">
                How can I help your support team today?
              </h2>
              <p className="text-[14px] md:text-[15px] text-[#A1A1AA] max-w-md mb-8 leading-relaxed">
                Ask questions about your knowledge base or request help drafting customer responses.
              </p>

              {/* Suggestion Chips - Wrapped cleanly for mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg text-left">
                {[
                  "What is our refund policy?",
                  "Summarize onboarding docs",
                  "How do I reset my password?",
                  "What are the shipping guidelines?"
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    className="p-3 bg-[#111114] border border-white/[0.08] hover:border-white/[0.15] hover:bg-[#15151A] rounded-xl text-[13px] text-[#FAFAFA] transition-all text-left truncate"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Stream */
            <div className="space-y-6 pb-4">
              {messages.map((msg, index) => (
                <ChatMessage 
                  key={index} 
                  role={msg.role} 
                  content={msg.content} 
                  sources={index === messages.length - 1 ? sources : undefined} 
                />
              ))}
              
              {loading && (
                <div className="flex gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 bg-[#111114]">
                    <Sparkles size={16} className="text-[#FAFAFA]" />
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-[#A1A1AA] py-2">
                    <Loader2 size={16} className="animate-spin text-[#8B5CF6]" />
                    <span>Searching knowledge base and formulating response...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom Composer - Fully responsive on 390px mobile */}
      <div className="p-4 md:p-6 bg-[#09090B] border-t border-white/[0.08] shrink-0">
        <div className="max-w-3xl mx-auto w-full">
          <form onSubmit={handleSend} className="relative flex items-center bg-[#111114] border border-white/[0.08] rounded-xl focus-within:border-[#8B5CF6]/50 focus-within:ring-1 focus-within:ring-[#8B5CF6]/20 transition-all shadow-lg">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your knowledge base..."
              className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#71717A] text-[14px] py-3.5 pl-4 pr-12 outline-none"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2.5 p-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-white/[0.04] disabled:text-[#71717A] text-[#FAFAFA] rounded-lg transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[11px] text-[#71717A]">SupportAI uses vector search over your uploaded documents.</span>
            <span className="text-[11px] text-[#71717A] hidden sm:inline">Press Enter to send</span>
          </div>
        </div>
      </div>

    </div>
  );
}