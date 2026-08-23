'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Sparkles, MessageSquare, MessageCircle, ChevronRight, Loader2 } from 'lucide-react';
import { getConversationsList } from '@/lib/api';

export default function ConversationsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getConversationsList();
        setConversations(data);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredConversations = conversations.filter(conv => {
    // Safely get the first message text, or default to empty string
    const firstMessage = conv.messages?.[0]?.content || '';
    return firstMessage.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-[#09090B] overflow-y-auto p-6 md:p-10">
      <div className="max-w-5xl mx-auto w-full space-y-8 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-semibold text-[#FAFAFA] tracking-tight mb-2">Conversations</h2>
            <p className="text-[15px] text-[#A1A1AA]">View and manage your AI support conversations.</p>
          </div>
          {/* BUG FIX: Proper URL parameters to wipe memory and open a new chat */}
          <Link 
            href="/?view=chat&new=true"
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FAFAFA] text-[14px] font-medium rounded-[8px] transition-colors shadow-sm shrink-0"
          >
            <Plus size={16} /> New conversation
          </Link>
        </div>

        {/* Toolbar Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-full max-w-[400px] flex items-center bg-[#111114] border border-white/[0.08] rounded-lg focus-within:border-[#8B5CF6]/50 focus-within:ring-1 focus-within:ring-[#8B5CF6]/20 transition-all">
            <Search size={16} className="text-[#71717A] absolute left-3.5" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#71717A] text-[14px] py-2.5 pl-10 pr-4 outline-none"
              disabled={loading || conversations.length === 0}
            />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="bg-[#111114] border border-white/[0.08] rounded-xl overflow-hidden min-h-[320px] flex flex-col">
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[#8B5CF6]" />
            </div>
          ) : conversations.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-[14px] flex items-center justify-center mb-4">
                <Sparkles size={20} className="text-[#FAFAFA]" />
              </div>
              <h3 className="text-[16px] font-medium text-[#FAFAFA] mb-2">No conversations yet</h3>
              <p className="text-[14px] text-[#A1A1AA] mb-6 max-w-sm leading-relaxed">
                Start a conversation with your AI assistant and your conversations will appear here.
              </p>
              {/* BUG FIX: Added correct URL parameters here too */}
              <Link 
                href="/?view=chat&new=true"
                className="px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-[#FAFAFA] text-[14px] font-medium rounded-[8px] transition-colors flex items-center gap-2"
              >
                <MessageSquare size={16} /> Start conversation
              </Link>
            </div>
          ) : (
            /* Real Database Data */
            <div className="flex flex-col">
              {filteredConversations.map((conv) => (
                // Note: We are linking to the chat view and passing the specific conversation ID!
                <Link 
                  key={conv.id}
                  href={`/?view=chat&id=${conv.id}`} 
                  className="group flex items-center justify-between p-5 border-b border-white/[0.04] last:border-0 hover:bg-[#15151A] transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-2.5 bg-[#09090B] border border-white/[0.08] rounded-lg shrink-0 mt-0.5">
                      <MessageCircle size={18} className="text-[#A1A1AA] group-hover:text-[#8B5CF6] transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-medium text-[#FAFAFA] truncate mb-1">
                        {conv.messages?.[0]?.content || 'New Conversation'}
                      </h4>
                      <p className="text-[13px] text-[#71717A]">
                        {new Date(conv.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#71717A] group-hover:text-[#FAFAFA] transition-colors shrink-0 ml-4" />
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}