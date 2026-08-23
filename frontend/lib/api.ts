// Hardcoded to strictly enforce the /api path and bypass .env conflicts
const API_URL = 'http://localhost:5000/api';

// Helper to dynamically attach the JWT token to every request
function getAuthHeaders(isFormData = false) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Only add Content-Type if we aren't sending a file (FormData sets its own boundary)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
}

// ==========================================
// DOCUMENT INGESTION INTERFACES & FUNCTIONS
// ==========================================

export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  createdAt: string;
  _count: { chunks: number };
}

export async function getDocuments(organizationId: string): Promise<Document[]> {
  const res = await fetch(`${API_URL}/ingest/documents`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch documents');
  }

  const data = await res.json();
  return data.documents;
}

export async function uploadDocument(file: File, organizationId: string) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/ingest/upload`, {
    method: 'POST',
    headers: getAuthHeaders(true), 
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to upload document');
  }

  return res.json();
}

// ==========================================
// CHAT INTERFACES & FUNCTIONS
// ==========================================

export interface Source {
  id: string;
  content: string;
  score: number;
  fileName?: string;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  createdAt: string;
}

export async function sendMessage(message: string, organizationId: string, conversationId?: string) {
  const res = await fetch(`${API_URL}/chat/message`, {
    method: 'POST',
    headers: getAuthHeaders(),
    // We added conversationId to the body here!
    body: JSON.stringify({ message, organizationId, conversationId }), 
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return res.json();
}

export async function deleteDocument(id: string) {
  const res = await fetch(`${API_URL}/ingest/documents/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete document');
  }
  return res.json();
}

export async function getConversationsList() {
  const res = await fetch(`${API_URL}/chat/conversations`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store', // Never cache this, always get fresh data!
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch conversations');
  }

  const data = await res.json();
  return data.conversations;
}

export async function getConversationMessages(id: string) {
  const res = await fetch(`${API_URL}/chat/conversations/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch conversation');
  }

  const data = await res.json();
  return data;
}

export function setAuthToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
}