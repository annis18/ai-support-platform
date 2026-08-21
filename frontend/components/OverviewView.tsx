'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { getDocuments, setAuthToken, Document } from '@/lib/api';
import { FileText, MessageSquare, Activity, Sparkles, Database, Loader2, Plus, CheckCircle2, XCircle } from 'lucide-react';

export default function OverviewView({ organizationId }: { organizationId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { getToken, isSignedIn } = useAuth();

  const loadDashboardData = async () => {
    try {
      const token = await getToken();
      setAuthToken(token);
      
      const docs = await getDocuments(organizationId);
      setDocuments(docs);
      setAiStatus('connected');
    } catch (err) {
      console.error('[Dashboard Error]:', err);
      setAiStatus('error');
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    // eslint-disable-next-line
    if (isSignedIn) loadDashboardData();
    // eslint-disable-next-line
  }, [isSignedIn]);
  const isProcessing = documents.some(doc => doc.status !== 'completed');
  const knowledgeStatus = documents.length === 0 ? 'No data' : isProcessing ? 'Processing' : 'Ready';

  return (
// ... keep the rest of the file exactly the same
    <div className="flex flex-col h-full bg-[#09090B] overflow-y-auto p-6 md:p-10">
      <div className="max-w-5xl mx-auto w-full space-y-8 pb-10">
        
        {/* Header Section */}
        <div>
          <h2 className="text-[28px] font-semibold text-[#FAFAFA] tracking-tight mb-2">Overview</h2>
          <p className="text-[15px] text-[#A1A1AA]">Your AI support workspace at a glance.</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111114] border border-white/[0.08] p-5 rounded-xl flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#A1A1AA]">Documents</span>
              <FileText size={16} className="text-[#71717A]" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-[28px] font-semibold text-[#FAFAFA] leading-none">
                {loading ? <Loader2 size={24} className="animate-spin text-[#71717A]" /> : documents.length}
              </span>
            </div>
          </div>

          <div className="bg-[#111114] border border-white/[0.08] p-5 rounded-xl flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#A1A1AA]">Conversations</span>
              <MessageSquare size={16} className="text-[#71717A]" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-[28px] font-semibold text-[#FAFAFA] leading-none">
                {loading ? <Loader2 size={24} className="animate-spin text-[#71717A]" /> : 0}
              </span>
            </div>
          </div>

          <div className="bg-[#111114] border border-white/[0.08] p-5 rounded-xl flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#A1A1AA]">AI Status</span>
              <Activity size={16} className="text-[#71717A]" />
            </div>
            <div className="flex items-center gap-2">
              {aiStatus === 'checking' && <><Loader2 size={14} className="animate-spin text-[#F59E0B]" /><span className="text-[15px] font-medium text-[#FAFAFA]">Checking...</span></>}
              {aiStatus === 'connected' && <><span className="w-2 h-2 rounded-full bg-[#22C55E]"></span><span className="text-[15px] font-medium text-[#FAFAFA]">Connected</span></>}
              {aiStatus === 'error' && <><XCircle size={16} className="text-[#EF4444]" /><span className="text-[15px] font-medium text-[#EF4444]">Unavailable</span></>}
            </div>
          </div>

          <div className="bg-[#111114] border border-white/[0.08] p-5 rounded-xl flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#A1A1AA]">Indexed Knowledge</span>
              <Database size={16} className="text-[#71717A]" />
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <Loader2 size={14} className="animate-spin text-[#71717A]" />
              ) : knowledgeStatus === 'Ready' ? (
                <><CheckCircle2 size={16} className="text-[#22C55E]" /><span className="text-[15px] font-medium text-[#FAFAFA]">Ready</span></>
              ) : knowledgeStatus === 'Processing' ? (
                <><Loader2 size={14} className="animate-spin text-[#F59E0B]" /><span className="text-[15px] font-medium text-[#F59E0B]">Processing</span></>
              ) : (
                <span className="text-[15px] font-medium text-[#71717A]">No data yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Lower Dashboard Area - items-start prevents unnatural vertical stretching */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Knowledge Base Prominent Card */}
            <div className="bg-[#111114] border border-white/[0.08] p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database size={18} className="text-[#FAFAFA]" />
                  <h3 className="text-[16px] font-medium text-[#FAFAFA]">Knowledge Base</h3>
                </div>
                <p className="text-[14px] text-[#A1A1AA]">
                  Your AI currently has access to <strong className="text-[#FAFAFA] font-medium">{loading ? '...' : documents.length}</strong> indexed documents.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href="/?view=documents" className="px-4 py-2 text-[13px] font-medium text-[#FAFAFA] bg-white/[0.08] hover:bg-white/[0.12] rounded-lg transition-colors">
                  View documents
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#111114] border border-white/[0.08] rounded-xl p-6">
              <h3 className="text-[16px] font-medium text-[#FAFAFA] mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Link href="/?view=chat" className="flex items-center gap-2 px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FAFAFA] text-[14px] font-medium rounded-[8px] transition-colors shadow-sm">
                  <Sparkles size={16} /> Ask AI
                </Link>
                <Link href="/?view=documents" className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-[#FAFAFA] text-[14px] font-medium rounded-[8px] transition-colors">
                  <Plus size={16} className="text-[#A1A1AA]" /> Upload document
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity - Now naturally sized */}
          <div className="lg:col-span-1 bg-[#111114] border border-white/[0.08] rounded-xl p-6 flex flex-col">
            <h3 className="text-[16px] font-medium text-[#FAFAFA] mb-6">Recent Activity</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-10 h-10 bg-white/[0.04] border border-white/[0.08] rounded-[10px] flex items-center justify-center mb-4">
                <Activity size={18} className="text-[#71717A]" />
              </div>
              <p className="text-[14px] font-medium text-[#FAFAFA] mb-1">No recent activity</p>
              <p className="text-[13px] text-[#A1A1AA] max-w-[200px] leading-relaxed">
                Your document uploads and conversations will appear here.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}