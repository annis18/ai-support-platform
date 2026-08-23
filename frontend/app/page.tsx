'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OverviewView from '@/components/OverviewView';
import DocumentsView from '@/components/DocumentsView';
import ChatInterface from '@/components/ChatInterface';
import SearchView from '@/components/SearchView';
import SettingsView from '@/components/SettingsView';
import AnalyticsView from '@/components/AnalyticsView';
import ConversationsView from '@/components/ConversationsView';
import DocumentSidebar from '@/components/DocumentSidebar';

function DashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'overview';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; organizationId: string } | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';

    try {
      const res = await fetch(`https://ai-support-backend-96gd.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      // Save credentials and update state
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#09090B] text-white">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#09090B]">
        <div className="w-96 p-8 rounded-xl bg-[#111114] border border-white/[0.08] shadow-2xl">
          <div className="flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-8 h-8 bg-[#8B5CF6] rounded-lg flex items-center justify-center text-white font-bold">AI</div>
            <h1 className="text-xl font-semibold text-white tracking-tight">SupportAI</h1>
          </div>

          <h2 className="text-lg font-medium text-white mb-6 text-center">
            {isLoginMode ? 'Welcome back' : 'Create an account'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-[#A1A1AA] mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-[14px] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#A1A1AA] mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-[14px] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                required
              />
            </div>

            {error && <p className="text-[#EF4444] text-[13px] text-center">{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[14px] font-medium rounded-lg transition-colors mt-2"
            >
              {isLoginMode ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="text-[#A1A1AA] text-[13px] text-center mt-6">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-[#8B5CF6] hover:text-white transition-colors"
            >
              {isLoginMode ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#09090B] text-white overflow-hidden font-sans">
      <DocumentSidebar currentView={view} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {view === 'overview' && <OverviewView organizationId={user.organizationId} />}
        {view === 'chat' && <ChatInterface organizationId={user.organizationId} />}
        {view === 'documents' && <DocumentsView organizationId={user.organizationId} />}
        {view === 'search' && <SearchView organizationId={user.organizationId} />}
        {view === 'conversations' && <ConversationsView />}
        {view === 'analytics' && <AnalyticsView />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#09090B] flex items-center justify-center text-white">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}