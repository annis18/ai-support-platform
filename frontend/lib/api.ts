import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add Clerk token to every request automatically
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface Source {
  fileName: string;
  documentId: string;
  chunkIndex: number;
  preview: string;
}

export interface ChatResponse {
  conversationId: string;
  answer: string;
  sources: Source[];
}

export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  createdAt: string;
  _count: { chunks: number };
}

export async function sendMessage(
  message: string,
  organizationId: string,
  conversationId?: string
): Promise<ChatResponse> {
  const { data } = await api.post('/api/chat/message', {
    message,
    organizationId,
    conversationId,
  });
  return data;
}

export async function uploadDocument(
  file: File,
  organizationId: string
): Promise<{ documentId: string; chunksCreated: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('organizationId', organizationId);
  const { data } = await api.post('/api/ingest/upload', formData);
  return data;
}

export async function getDocuments(organizationId: string): Promise<Document[]> {
  const { data } = await api.get(
    `/api/ingest/documents?organizationId=${organizationId}`
  );
  return data.documents;
}