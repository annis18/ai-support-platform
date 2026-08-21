'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { getDocuments, setAuthToken } from '@/lib/api';
import { LayoutDashboard, Sparkles, MessageSquare, FileText, Library, Search, BarChart2, Settings, HelpCircle, User, Menu, X } from 'lucide-react';

export default function DocumentSidebar({ organizationId }: { organizationId: string }) {
  const [docCount, setDocCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  
  const isOverview = view === 'overview';
  const isDocs = view === 'documents';
  const isConversations = view === 'conversations';
  const isSettings = view === 'settings';
  const isSearch = view === 'search';
  const isAnalytics = view === 'analytics';
  const isChat = !isOverview && !isDocs && !isConversations && !isSettings && !isSearch && !isAnalytics;

  const loadCount = async () => {
    try {
      const token = await getToken();
      setAuthToken(token);
      const docs = await getDocuments(organizationId);
      setDocCount(docs.length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    if (isSignedIn) loadCount();
    // eslint-disable-next-line
  }, [isSignedIn]);
  useEffect(() => {
    // eslint-disable-next-line
    setMobileOpen(false);
  }, [view]);

  return (
// ... keep the rest of the file exactly the same
  
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors p-1 bg-[#09090B] rounded-md"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[240px] bg-[#0C0C0F] border-r border-white/[0.08] flex flex-col h-full shrink-0 select-none transform transition-transform duration-200 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-[60px] flex items-center justify-between px-5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#FAFAFA]" />
            <span className="text-[15px] font-semibold text-[#FAFAFA] tracking-wide">SupportAI</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-[#71717A] hover:text-[#FAFAFA]">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-8">
          <div>
            <p className="px-3 text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-2">Workspace</p>
            <nav className="space-y-0.5">
              <Link href="/?view=overview" className={`w-full flex items-center gap-3 px-3 py-2 h-9 text-[14px] font-medium rounded-lg transition-colors ${isOverview ? 'text-[#FAFAFA] bg-[rgba(139,92,246,0.12)]' : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111114]'}`}>
                <LayoutDashboard size={16} className={isOverview ? "text-[#A78BFA]" : ""} /> Overview
              </Link>
              <Link href="/?view=chat" className={`w-full flex items-center gap-3 px-3 py-2 h-9 text-[14px] font-medium rounded-lg transition-colors ${isChat ? 'text-[#FAFAFA] bg-[rgba(139,92,246,0.12)]' : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111114]'}`}>
                <Sparkles size={16} className={isChat ? "text-[#A78BFA]" : ""} /> AI Assistant
              </Link>
              <Link href="/?view=conversations" className={`w-full flex items-center gap-3 px-3 py-2 h-9 text-[14px] font-medium rounded-lg transition-colors ${isConversations ? 'text-[#FAFAFA] bg-[rgba(139,92,246,0.12)]' : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111114]'}`}>
                <MessageSquare size={16} className={isConversations ? "text-[#A78BFA]" : ""} /> Conversations
              </Link>
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-2">Knowledge</p>
            <nav className="space-y-0.5">
              <Link href="/?view=documents" className={`w-full flex items-center justify-between px-3 py-2 h-9 text-[14px] font-medium rounded-lg transition-colors ${isDocs ? 'text-[#FAFAFA] bg-[rgba(139,92,246,0.12)]' : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111114]'}`}>
                <div className="flex items-center gap-3">
                  <FileText size={16} className={isDocs ? "text-[#A78BFA]" : ""} /> Documents
                </div>
                {docCount > 0 && <span className="text-[12px] font-medium text-[#A1A1AA]">{docCount}</span>}
              </Link>
              <button className="w-full flex items-center gap-3 px-3 py-2 h-9 text-[14px] font-medium text-[#A1A1AA] hover:text-[#FAFAFA] rounded-lg hover:bg-[#111114] transition-colors">
                <Library size={16} /> Collections
              </button>
              <Link href="/?view=search" className={`w-full flex items-center gap-3 px-3 py-2 h-9 text-[14px] font-medium rounded-lg transition-colors ${isSearch ? 'text-[#FAFAFA] bg-[rgba(139,92,246,0.12)]' : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111114]'}`}>
                <Search size={16} className={isSearch ? "text-[#A78BFA]" : ""} /> Search
              </Link>
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-2">Insights</p>
            <nav className="space-y-0.5">
              <Link href="/?view=analytics" className={`w-full flex items-center gap-3 px-3 py-2 h-9 text-[14px] font-medium rounded-lg transition-colors ${isAnalytics ? 'text-[#FAFAFA] bg-[rgba(139,92,246,0.12)]' : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111114]'}`}>
                <BarChart2 size={16} className={isAnalytics ? "text-[#A78BFA]" : ""} /> Analytics
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Nav & Signature Container */}
        <div className="p-3 border-t border-white/[0.08] shrink-0 flex flex-col">
          <div className="space-y-0.5">
            <Link href="/?view=settings" className={`w-full flex items-center gap-3 px-3 py-2 h-9 text-[14px] font-medium rounded-lg transition-colors ${isSettings ? 'text-[#FAFAFA] bg-white/[0.08]' : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111114]'}`}>
              <Settings size={16} className={isSettings ? "text-[#FAFAFA]" : ""} /> Settings
            </Link>
            <button className="w-full flex items-center gap-3 px-3 py-2 h-9 text-[14px] font-medium text-[#A1A1AA] hover:text-[#FAFAFA] rounded-lg hover:bg-[#111114] transition-colors">
              <HelpCircle size={16} /> Help & Support
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 h-9 text-[14px] font-medium text-[#A1A1AA] hover:text-[#FAFAFA] rounded-lg hover:bg-[#111114] transition-colors">
              <User size={16} /> User Profile
            </button>
          </div>
          
          {/* Subtle Personal Signature */}
          <div className="pt-4 pb-1 text-center hidden md:block">
            <span className="text-[11px] text-[#52525B] opacity-70 hover:text-[#A1A1AA] hover:opacity-100 transition-all cursor-default select-none">
              ASC18
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}