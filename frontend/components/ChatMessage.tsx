import { Source } from '@/lib/api';
import { FileText, Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

export default function ChatMessage({ role, content, sources }: Props) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[80%] bg-[#111114] border border-white/[0.08] px-5 py-3.5 rounded-2xl text-[15px] text-[#FAFAFA] whitespace-pre-wrap leading-relaxed shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 w-full">
      <div className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 bg-[#111114]">
        <Sparkles size={16} className="text-[#FAFAFA]" />
      </div>

      <div className="flex-1 space-y-4 max-w-[85%]">
        <div className="text-sm font-semibold text-[#FAFAFA] mb-1 flex items-center gap-2">
          SupportAI
        </div>
        
        {/* Enforcing crisp white text here */}
        <div className="text-[15px] text-[#FAFAFA] whitespace-pre-wrap leading-relaxed">
          {content}
        </div>

        {/* Real Backend Source Data Cards */}
        {sources && sources.length > 0 && (
          <div className="pt-4 border-t border-white/[0.08]">
            <p className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-3">Sources</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sources.map((source, i) => (
                <div key={i} className="group flex flex-col justify-between p-3.5 bg-[#111114] border border-white/[0.08] rounded-xl hover:border-white/[0.15] transition-all cursor-pointer">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-[#09090B] border border-white/[0.08] rounded-lg shrink-0">
                      <FileText size={16} className="text-[#A1A1AA]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#FAFAFA] truncate mb-1" title={source.fileName}>
                        {source.fileName}
                      </p>
                      <p className="text-xs text-[#71717A]">PDF · Chunk Match</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                     <span className="text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors flex items-center gap-1">
                       View source <ChevronRight size={12} />
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}