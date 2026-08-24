'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getDocuments, uploadDocument, deleteDocument, Document } from '@/lib/api';
import { Search, Plus, FileText, Loader2, Upload, MoreHorizontal, Copy, Check, Trash2 } from 'lucide-react';

export default function DocumentsView({ organizationId }: { organizationId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const response = await getDocuments(organizationId);
      // Handles both direct array responses and wrapped { documents: [...] } objects
      const docsList = Array.isArray(response) 
        ? response 
        : (response?.documents || response?.data || []);
        
      setDocuments(docsList);
      setError('');
    } catch (err: unknown) {
      console.error('[Documents Error]:', err);
      setError('Failed to fetch documents from server');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);
  
  async function executeUpload() {
    if (!selectedFile || !organizationId) return;
    setUploading(true);
    setError('');
    
    try {
      await uploadDocument(selectedFile, organizationId);
      await loadDocuments();
      closeModal();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this document? This will remove it from the AI knowledge base entirely.')) return;
    
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocuments(docs => docs.filter(doc => doc.id !== id));
      setOpenMenuId(null);
    } catch (err: unknown) {
      console.error('[Delete Error]:', err);
      alert('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  }

  const validateAndSetFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.txt')) {
      setError('Invalid file type. Please upload a .pdf or .txt file.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  }

  function closeModal() {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleCopy(fileName: string, id: string) {
    navigator.clipboard.writeText(fileName);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
      setOpenMenuId(null);
    }, 2000);
  }

  const filteredDocuments = Array.isArray(documents)
    ? documents.filter(doc => (doc.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col h-full bg-[#09090B] overflow-y-auto p-6 md:p-10" onClick={() => setOpenMenuId(null)}>
      <div className="max-w-5xl mx-auto w-full space-y-6 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
          <div>
            <h2 className="text-[28px] font-semibold text-[#FAFAFA] tracking-tight mb-2">Documents</h2>
            <p className="text-[15px] text-[#A1A1AA]">Manage the documents your AI uses to answer questions.</p>
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FAFAFA] text-[14px] font-medium rounded-[8px] transition-colors shadow-sm shrink-0"
          >
            <Plus size={16} /> Upload document
          </button>
        </div>

        {/* Search & Count Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-full max-w-[320px] flex items-center bg-[#111114] border border-white/[0.08] rounded-lg focus-within:border-[#8B5CF6]/50 focus-within:ring-1 focus-within:ring-[#8B5CF6]/20 transition-all">
            <Search size={16} className="text-[#71717A] absolute left-3.5" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#71717A] text-[14px] py-2 pl-10 pr-4 outline-none"
            />
          </div>
          <div className="hidden sm:block h-4 w-[1px] bg-white/[0.08]"></div>
          <div className="text-[14px] text-[#A1A1AA] font-medium">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-[#111114] border border-white/[0.08] rounded-xl">
          
          <div className="hidden md:flex items-center px-6 py-3 border-b border-white/[0.08] bg-[#0C0C0F] rounded-t-xl">
            <div className="flex-[2] text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Name</div>
            <div className="flex-1 text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Type</div>
            <div className="flex-1 text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Chunks</div>
            <div className="flex-1 text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Status</div>
            <div className="w-8"></div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={24} className="animate-spin text-[#8B5CF6]" />
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredDocuments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <FileText size={32} className="text-[#A1A1AA] mb-4" />
              <h3 className="text-[16px] font-medium text-[#FAFAFA] mb-2">No documents yet</h3>
              <p className="text-[14px] text-[#A1A1AA] mb-6 max-w-xs leading-relaxed">
                Upload your first document to give your AI knowledge to work with.
              </p>
              <button 
                onClick={() => setIsUploadModalOpen(true)} 
                className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FAFAFA] text-[14px] font-medium rounded-[8px] transition-colors"
              >
                Upload document
              </button>
            </div>
          )}

          {/* Documents List */}
          {!loading && filteredDocuments.map((doc) => (
            <div key={doc.id}>
              {/* Desktop Row */}
              <div className="hidden md:flex items-center px-6 py-4 border-b border-white/[0.04] hover:bg-[#15151A] transition-colors last:border-0 last:rounded-b-xl">
                <div className="flex-[2] flex items-center gap-3 min-w-0 pr-6 relative group">
                  <FileText size={16} className="text-[#71717A] shrink-0" />
                  <span className="text-[14px] font-medium text-[#FAFAFA] truncate cursor-default">
                    {doc.fileName}
                  </span>
                  <div className="absolute left-8 bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    <div className="bg-[#18181B] border border-white/[0.08] text-[#FAFAFA] text-[12px] px-2.5 py-1.5 rounded-md shadow-xl whitespace-nowrap">
                      {doc.fileName}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 text-[14px] text-[#A1A1AA]">PDF</div>
                <div className="flex-1 text-[14px] text-[#A1A1AA]">{doc._count?.chunks || 0} chunk{doc._count?.chunks !== 1 ? 's' : ''}</div>
                
                <div className="flex-1 flex items-center gap-2">
                  {doc.status === 'completed' || !doc.status ? (
                    <><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> <span className="text-[14px] text-[#A1A1AA]">Ready</span></>
                  ) : (
                    <><Loader2 size={12} className="animate-spin text-[#F59E0B]" /> <span className="text-[14px] text-[#F59E0B]">Processing</span></>
                  )}
                </div>

                <div className="w-8 flex justify-end relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === doc.id ? null : doc.id); }}
                    className="text-[#71717A] hover:text-[#FAFAFA] p-1.5 rounded hover:bg-white/[0.08] transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {openMenuId === doc.id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-8 w-44 bg-[#111114] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-1.5 flex flex-col"
                    >
                      <button 
                        onClick={() => handleCopy(doc.fileName, doc.id)}
                        className="w-full text-left px-3 py-2 text-[13px] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B] transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2.5"><Copy size={14}/> Copy filename</span>
                        {copiedId === doc.id && <Check size={14} className="text-[#22C55E]" />}
                      </button>
                      <div className="h-[1px] w-full bg-white/[0.04] my-1"></div>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="w-full text-left px-3 py-2 text-[13px] text-[#EF4444] hover:text-[#F87171] hover:bg-[#EF4444]/10 transition-colors flex items-center justify-between disabled:opacity-50"
                      >
                        <span className="flex items-center gap-2.5">
                          {deletingId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14}/>} 
                          Delete
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Card */}
              <div className="md:hidden flex flex-col p-4 border-b border-white/[0.04] hover:bg-[#15151A] transition-colors last:border-0 last:rounded-b-xl relative">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0 group relative">
                    <FileText size={16} className="text-[#71717A] shrink-0" />
                    <span className="text-[14px] font-medium text-[#FAFAFA] truncate cursor-default">{doc.fileName}</span>
                  </div>
                  
                  <div className="relative shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === doc.id ? null : doc.id); }}
                      className="text-[#71717A] hover:text-[#FAFAFA] p-1 rounded transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === doc.id && (
                      <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-6 w-40 bg-[#111114] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-1.5 flex flex-col">
                        <button onClick={() => handleCopy(doc.fileName, doc.id)} className="w-full text-left px-3 py-2 text-[13px] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B] transition-colors flex items-center justify-between">
                          <span className="flex items-center gap-2.5"><Copy size={14}/> Copy name</span>
                          {copiedId === doc.id && <Check size={14} className="text-[#22C55E]" />}
                        </button>
                        <div className="h-[1px] w-full bg-white/[0.04] my-1"></div>
                        <button onClick={() => handleDelete(doc.id)} disabled={deletingId === doc.id} className="w-full text-left px-3 py-2 text-[13px] text-[#EF4444] hover:text-[#F87171] hover:bg-[#EF4444]/10 transition-colors flex items-center justify-between disabled:opacity-50">
                          <span className="flex items-center gap-2.5">
                            {deletingId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14}/>} Delete
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[13px] text-[#A1A1AA]">
                    <span>PDF</span>
                    <span>{doc._count?.chunks || 0} chunk{doc._count?.chunks !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {doc.status === 'completed' || !doc.status ? (
                      <><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> <span className="text-[13px] text-[#A1A1AA]">Ready</span></>
                    ) : (
                      <><Loader2 size={10} className="animate-spin text-[#F59E0B]" /> <span className="text-[13px] text-[#F59E0B]">Processing</span></>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-[#111114] border border-white/[0.08] rounded-[16px] w-full max-w-[440px] shadow-2xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-[18px] font-semibold text-[#FAFAFA] mb-1.5">Upload documents</h2>
              <p className="text-[14px] text-[#A1A1AA] mb-6">Upload PDF or TXT files to your knowledge base.</p>
              
              <div 
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border border-dashed border-white/[0.15] hover:border-[#8B5CF6]/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#09090B] hover:bg-[#15151A] text-center min-h-[160px] ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {uploading ? (
                  <>
                    <Loader2 size={24} className="animate-spin text-[#8B5CF6] mb-3" />
                    <p className="text-[14px] font-medium text-[#FAFAFA]">Uploading...</p>
                    <p className="text-[12px] text-[#71717A] mt-1">Please wait while we process this file.</p>
                  </>
                ) : selectedFile ? (
                   <>
                    <FileText size={24} className="text-[#8B5CF6] mb-3" />
                    <p className="text-[14px] font-medium text-[#FAFAFA] truncate max-w-[250px]">{selectedFile.name}</p>
                    <p className="text-[12px] text-[#71717A] mt-1">Click to select a different file</p>
                   </>
                ) : (
                  <>
                    <Upload size={20} className="text-[#A1A1AA] mb-3" />
                    <p className="text-[14px] font-medium text-[#FAFAFA] mb-1">Drop files here</p>
                    <p className="text-[14px] text-[#A1A1AA] mb-3">or browse from your computer</p>
                    <p className="text-[12px] text-[#71717A]">PDF, TXT · Maximum 10 MB</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={handleFileSelect} className="hidden" />
              
              {error && (
                <div className="mt-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg text-[13px] text-[#EF4444]">
                  {error}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#09090B] border-t border-white/[0.04]">
              <button 
                onClick={closeModal} 
                disabled={uploading} 
                className="px-4 py-2 text-[14px] font-medium text-[#FAFAFA] hover:bg-white/[0.08] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeUpload} 
                disabled={!selectedFile || uploading} 
                className="px-4 py-2 text-[14px] font-medium bg-[#FAFAFA] hover:bg-[#E4E4E7] text-[#09090B] disabled:bg-white/[0.08] disabled:text-[#71717A] rounded-lg transition-colors shadow-sm"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}