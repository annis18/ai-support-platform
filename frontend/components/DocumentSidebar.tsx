'use client';

import { useEffect, useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getDocuments, uploadDocument, Document } from '@/lib/api';

interface Props {
  organizationId: string;
}

export default function DocumentSidebar({ organizationId }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const docs = await getDocuments(organizationId);
      setDocuments(docs);
    } catch (err: unknown) {
      console.error('Failed to load documents:', err);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      await uploadDocument(file, organizationId);
      await loadDocuments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function getStatusIcon(status: string) {
    if (status === 'completed') return <CheckCircle size={12} className="text-green-400" />;
    if (status === 'failed') return <XCircle size={12} className="text-red-400" />;
    return <Loader2 size={12} className="text-yellow-400 animate-spin" />;
  }

  return (
    <div className="w-64 bg-[#141414] border-r border-[#222] flex flex-col h-full">
      <div className="p-4 border-b border-[#222]">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Knowledge Base</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg"
        >
          {uploading ? (
            <><Loader2 size={14} className="animate-spin" /> Processing...</>
          ) : (
            <><Upload size={14} /> Upload</>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {documents.length === 0 ? (
          <p className="text-gray-500 text-xs text-center mt-8">No documents yet</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-start gap-2 p-2 rounded-lg bg-[#1a1a1a]">
              <FileText size={14} className="text-indigo-400 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-gray-200 truncate">{doc.fileName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {getStatusIcon(doc.status)}
                  <span className="text-xs text-gray-500">
                    {doc.status === 'completed' ? `${doc._count.chunks} chunks` : doc.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}