'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Sparkles, MessageSquare } from 'lucide-react';

export default function ConversationsView() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Honest empty state with zero fake data
  const [conversations] = useState([]);

  return (
    <div className="flex flex-col h-full bg-[#09090B] overflow-y-auto p-6 md:p-10">
      <div className="max-w-5xl mx-auto w-full space-y-8 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-semibold text-[#FAFAFA] tracking-tight mb-2">Conversations</h2>
            <p className="text-[15px] text-[#A1A1AA]">View and manage your AI support conversations.</p>
          </div>
          <Link 
            href="/"
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
              disabled={conversations.length === 0}
            />
          </div>
        </div>

        {/* Dynamic Content Area with Balanced Height */}
        <div className="bg-[#111114] border border-white/[0.08] rounded-xl overflow-hidden min-h-[320px] flex flex-col">
          
          {conversations.length === 0 ? (
            /* Honest Balanced Empty State */
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-[14px] flex items-center justify-center mb-4">
                <Sparkles size={20} className="text-[#FAFAFA]" />
              </div>
              <h3 className="text-[16px] font-medium text-[#FAFAFA] mb-2">No conversations yet</h3>
              <p className="text-[14px] text-[#A1A1AA] mb-6 max-w-sm leading-relaxed">
                Start a conversation with your AI assistant and your conversations will appear here.
              </p>
              <Link 
                href="/"
                className="px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-[#FAFAFA] text-[14px] font-medium rounded-[8px] transition-colors flex items-center gap-2"
              >
                <MessageSquare size={16} /> Start conversation
              </Link>
            </div>
          ) : (
            <div className="hidden"></div>
          )}

        </div>
      </div>
    </div>
  );
}