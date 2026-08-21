import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import DocumentSidebar from '@/components/DocumentSidebar';
import ChatInterface from '@/components/ChatInterface';
import DocumentsView from '@/components/DocumentsView';
import ConversationsView from '@/components/ConversationsView';
import OverviewView from '@/components/OverviewView';
import SettingsView from '@/components/SettingsView';
import SearchView from '@/components/SearchView';
import AnalyticsView from '@/components/AnalyticsView'; // NEW
import { Search, Bell } from 'lucide-react';
import Link from 'next/link';

export default async function Home({ searchParams }: { searchParams: Promise<{ view?: string }> | { view?: string } }) {
  const { orgId, userId } = await auth();
  const organizationId = orgId || userId || 'default-org';
  
  const params = await searchParams;
  const view = params?.view || 'chat';

  // Dynamic header title
  const headerTitle = 
    view === 'overview' ? 'Overview' :
    view === 'documents' ? 'Documents' : 
    view === 'conversations' ? 'Conversations' : 
    view === 'settings' ? 'Settings' :
    view === 'search' ? 'Search' :
    view === 'analytics' ? 'Analytics' : // NEW
    'AI Assistant';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#09090B]">
      <DocumentSidebar organizationId={organizationId} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-[60px] pl-14 md:pl-6 flex items-center justify-between pr-6 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center">
            <h1 className="text-[21px] font-semibold text-[#FAFAFA] tracking-tight">
              {headerTitle}
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/?view=search" className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
              <Search size={18} />
            </Link>
            <button className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
              <Bell size={18} />
            </button>
            <div className="pl-4 border-l border-white/[0.08] flex items-center">
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-md" } }} />
            </div>
          </div>
        </header>

        {/* Main Workspace Area Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#09090B]">
          {view === 'overview' ? (
            <OverviewView organizationId={organizationId} />
          ) : view === 'documents' ? (
            <DocumentsView organizationId={organizationId} />
          ) : view === 'conversations' ? (
            <ConversationsView />
          ) : view === 'settings' ? (
            <SettingsView />
          ) : view === 'search' ? (
            <SearchView organizationId={organizationId} />
          ) : view === 'analytics' ? (
            <AnalyticsView /> // NEW
          ) : (
            <ChatInterface organizationId={organizationId} />
          )}
        </main>
      </div>
    </div>
  );
}