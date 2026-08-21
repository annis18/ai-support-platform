'use client';

import { BarChart2, Clock, AlertCircle, Sparkles, Database } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsView() {
  return (
    <div className="flex flex-col h-full bg-[#09090B] overflow-y-auto p-6 md:p-10">
      <div className="max-w-5xl mx-auto w-full space-y-8 pb-10">
        
        {/* Header Section */}
        <div>
          <h2 className="text-[28px] font-semibold text-[#FAFAFA] tracking-tight mb-2">Analytics</h2>
          <p className="text-[15px] text-[#A1A1AA]">Monitor AI usage, retrieval frequency, and system performance.</p>
        </div>

        {/* Metric Summary Cards (Honest Zero/Empty states) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111114] border border-white/[0.08] p-5 rounded-xl flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#A1A1AA]">Questions Asked</span>
              <Sparkles size={16} className="text-[#71717A]" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-[28px] font-semibold text-[#FAFAFA] leading-none">0</span>
              <span className="text-[12px] text-[#71717A] mb-0.5">total</span>
            </div>
          </div>

          <div className="bg-[#111114] border border-white/[0.08] p-5 rounded-xl flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#A1A1AA]">Retrieval Frequency</span>
              <Database size={16} className="text-[#71717A]" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-[28px] font-semibold text-[#FAFAFA] leading-none">0</span>
              <span className="text-[12px] text-[#71717A] mb-0.5">queries</span>
            </div>
          </div>

          <div className="bg-[#111114] border border-white/[0.08] p-5 rounded-xl flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#A1A1AA]">Avg Response Time</span>
              <Clock size={16} className="text-[#71717A]" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-[28px] font-semibold text-[#FAFAFA] leading-none">—</span>
              <span className="text-[12px] text-[#71717A] mb-0.5">sec</span>
            </div>
          </div>

          <div className="bg-[#111114] border border-white/[0.08] p-5 rounded-xl flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#A1A1AA]">System Errors</span>
              <AlertCircle size={16} className="text-[#71717A]" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-[28px] font-semibold text-[#22C55E] leading-none">0%</span>
              <span className="text-[12px] text-[#71717A] mb-0.5">failure rate</span>
            </div>
          </div>
        </div>

        {/* Main Analytics Content / Honest Empty State */}
        <div className="bg-[#111114] border border-white/[0.08] rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[380px]">
          <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-center mb-4">
            <BarChart2 size={22} className="text-[#A1A1AA]" />
          </div>
          <h3 className="text-[16px] font-medium text-[#FAFAFA] mb-2">No analytics data available</h3>
          <p className="text-[14px] text-[#A1A1AA] max-w-md mb-8 leading-relaxed">
            Analytics will automatically populate here as users query your AI assistant and interact with your knowledge base.
          </p>
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FAFAFA] text-[14px] font-medium rounded-lg transition-colors shadow-sm"
            >
              Test AI Assistant
            </Link>
            <Link 
              href="/?view=documents" 
              className="px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-[#FAFAFA] text-[14px] font-medium rounded-lg transition-colors"
            >
              Manage Documents
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}