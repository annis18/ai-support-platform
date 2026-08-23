'use client';

import Link from 'next/link';
import { LayoutDashboard, MessageSquare, FileText, Search, BarChart2, Settings, LogOut, Bot, MessageCircle } from 'lucide-react';

interface Props {
  currentView: string;
  onLogout: () => void;
}

export default function DocumentSidebar({ currentView, onLogout }: Props) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/?view=overview' },
    { id: 'chat', label: 'Get Answers', icon: MessageSquare, href: '/?view=chat' },
    { id: 'conversations', label: 'Conversations', icon: MessageCircle, href: '/?view=conversations' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/?view=documents' },
    { id: 'search', label: 'Search', icon: Search, href: '/?view=search' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, href: '/?view=analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/?view=settings' },
  ];

  return (
    <div className="w-64 bg-[#111114] border-r border-white/[0.08] flex flex-col h-full shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <span className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight">SupportAI</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Menu</p>
        </div>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' 
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={16} />
              <span className="text-[14px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Profile / Logout */}
      <div className="p-4 border-t border-white/[0.04]">
        <button 
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          onClick={onLogout}
        >
          <LogOut size={16} />
          <span className="text-[14px] font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}