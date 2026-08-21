'use client';

import { useUser } from '@clerk/nextjs';
import { Building2, Monitor, Cpu, Info, CheckCircle2 } from 'lucide-react';

export default function SettingsView() {
  const { user } = useUser();

  // Fallback to personal user data since Clerk Organizations are disabled
  const workspaceName = user?.fullName ? `${user.fullName}'s Workspace` : 'My Workspace';
  const orgId = user?.id || 'org_default';

  return (
    <div className="flex flex-col h-full bg-[#09090B] overflow-y-auto p-6 md:p-10">
      <div className="max-w-3xl mx-auto w-full space-y-8 pb-10">
        
        {/* Header Section */}
        <div>
          <h2 className="text-[28px] font-semibold text-[#FAFAFA] tracking-tight mb-2">Settings</h2>
          <p className="text-[15px] text-[#A1A1AA]">Manage your workspace and application preferences.</p>
        </div>

        <div className="space-y-6">
          
          {/* WORKSPACE */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Building2 size={16} className="text-[#FAFAFA]" />
              <h3 className="text-[14px] font-medium text-[#FAFAFA]">Workspace</h3>
            </div>
            <div className="bg-[#111114] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium text-[#FAFAFA] mb-1">Workspace name</p>
                  <p className="text-[13px] text-[#71717A]">Your primary account identifier.</p>
                </div>
                <div className="bg-[#09090B] border border-white/[0.08] px-3 py-2 rounded-lg text-[14px] text-[#FAFAFA] min-w-[200px] cursor-not-allowed opacity-80">
                  {workspaceName}
                </div>
              </div>
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium text-[#FAFAFA] mb-1">Workspace ID</p>
                  <p className="text-[13px] text-[#71717A]">Used for API routing and data isolation.</p>
                </div>
                <div className="text-[13px] font-mono text-[#A1A1AA] bg-white/[0.04] px-2 py-1 rounded">
                  {orgId}
                </div>
              </div>
            </div>
          </section>

          {/* AI */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Cpu size={16} className="text-[#FAFAFA]" />
              <h3 className="text-[14px] font-medium text-[#FAFAFA]">AI</h3>
            </div>
            <div className="bg-[#111114] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[#FAFAFA] mb-1">AI connection</p>
                  <p className="text-[13px] text-[#71717A]">Current status of the generative model.</p>
                </div>
                <div className="flex items-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                  <span className="text-[12px] font-medium text-[#22C55E]">Connected</span>
                </div>
              </div>
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium text-[#FAFAFA] mb-1">Knowledge-base behavior</p>
                  <p className="text-[13px] text-[#71717A]">How the AI retrieves context.</p>
                </div>
                <div className="text-[13px] font-medium text-[#A1A1AA] bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-lg">
                  Strict (Documents Only)
                </div>
              </div>
            </div>
          </section>

          {/* APPEARANCE */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Monitor size={16} className="text-[#FAFAFA]" />
              <h3 className="text-[14px] font-medium text-[#FAFAFA]">Appearance</h3>
            </div>
            <div className="bg-[#111114] border border-white/[0.08] rounded-xl p-5">
              <div className="flex items-center gap-3">
                <button className="flex-1 py-2.5 bg-[#8B5CF6] text-[#FAFAFA] text-[13px] font-medium rounded-lg border border-[#8B5CF6] shadow-sm transition-colors">
                  Dark
                </button>
                <button disabled className="flex-1 py-2.5 bg-[#09090B] text-[#71717A] text-[13px] font-medium rounded-lg border border-white/[0.08] cursor-not-allowed">
                  Light
                </button>
                <button disabled className="flex-1 py-2.5 bg-[#09090B] text-[#71717A] text-[13px] font-medium rounded-lg border border-white/[0.08] cursor-not-allowed">
                  System
                </button>
              </div>
              <p className="text-[12px] text-[#71717A] mt-3 text-center">
                Light and System themes are currently disabled in this version.
              </p>
            </div>
          </section>

          {/* ABOUT */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Info size={16} className="text-[#FAFAFA]" />
              <h3 className="text-[14px] font-medium text-[#FAFAFA]">About</h3>
            </div>
            <div className="bg-[#111114] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
                <p className="text-[14px] font-medium text-[#FAFAFA]">Version</p>
                <p className="text-[13px] text-[#A1A1AA]">1.0.0-beta</p>
              </div>
              <div className="p-5 flex items-center justify-between">
                <p className="text-[14px] font-medium text-[#FAFAFA]">System status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#22C55E]" />
                  <p className="text-[13px] text-[#A1A1AA]">All systems operational</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}