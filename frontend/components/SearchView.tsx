'use client';

import { useEffect, useState } from 'react';

import { getDocuments, setAuthToken, Document } from '@/lib/api';
import { Search, FileText, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SearchView({ organizationId }: { organizationId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDocuments = async () => {
    try {
      setAuthToken('demo-token');
      const docs = await getDocuments(organizationId);
      setDocuments(docs);
    } catch (err) {
      console.error('[Search Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line
  }, []);

  const filteredResults = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#09090B] overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto w-full space-y-8 pb-10">
        
        {/* Header Section */}
        <div>
          <h2 className="text-[28px] font-semibold text-[#FAFAFA] tracking-tight mb-2">Search</h2>
          <p className="text-[15px] text-[#A1A1AA]">Search your indexed knowledge base.</p>
        </div>

        {/* Large Prominent Search Bar */}
        <div className="relative w-full flex items-center bg-[#111114] border border-white/[0.12] rounded-xl focus-within:border-[#8B5CF6]/50 focus-within:ring-4 focus-within:ring-[#8B5CF6]/10 transition-all shadow-sm">
          <Search size={20} className="text-[#A1A1AA] absolute left-4" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#71717A] text-[16px] py-4 pl-12 pr-4 outline-none"
          />
          {loading && <Loader2 size={18} className="animate-spin text-[#8B5CF6] absolute right-4" />}
        </div>

        {/* Results Area */}
        <div className="flex flex-col gap-3">
          {searchQuery.trim() === '' ? (
            /* Initial Empty State */
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-center mb-4">
                <Search size={20} className="text-[#71717A]" />
              </div>
              <p className="text-[15px] font-medium text-[#FAFAFA] mb-1">Find anything</p>
              <p className="text-[14px] text-[#71717A]">Type a filename to instantly filter your knowledge base.</p>
            </div>
          ) : filteredResults.length > 0 ? (
            /* Search Results */
            <>
              <p className="text-[12px] font-medium text-[#71717A] uppercase tracking-wider mb-2 px-1">
                {filteredResults.length} Result{filteredResults.length !== 1 && 's'}
              </p>
              {filteredResults.map(doc => (
                <Link 
                  href="/?view=documents" 
                  key={doc.id} 
                  className="group bg-[#111114] border border-white/[0.08] p-5 rounded-xl hover:border-white/[0.15] hover:bg-[#15151A] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-2.5 bg-[#09090B] border border-white/[0.08] rounded-lg shrink-0 mt-0.5">
                      <FileText size={18} className="text-[#A1A1AA] group-hover:text-[#FAFAFA] transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-medium text-[#FAFAFA] truncate mb-1.5">{doc.fileName}</h4>
                      <p className="text-[13px] text-[#A1A1AA] line-clamp-2">
                        PDF Document · {doc._count?.chunks || 0} indexed chunks available for AI retrieval.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity">
                      View file
                    </span>
                    <ChevronRight size={16} className="text-[#71717A] group-hover:text-[#FAFAFA] transition-colors" />
                  </div>
                </Link>
              ))}
            </>
          ) : (
            /* No Results Found */
            <div className="py-16 text-center flex flex-col items-center justify-center bg-[#111114] border border-white/[0.08] rounded-xl">
              <p className="text-[15px] font-medium text-[#FAFAFA] mb-2">No documents found</p>
              <p className="text-[14px] text-[#A1A1AA] mb-6">We couldn&apos;t find anything matching &quot;{searchQuery}&quot;.</p>
              <Link href="/?view=chat" className="flex items-center gap-2 px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-[#FAFAFA] text-[13px] font-medium rounded-lg transition-colors">
                <Sparkles size={14} /> Ask AI instead
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}