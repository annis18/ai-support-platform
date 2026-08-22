'use client';

import { useState } from 'react';
import DocumentSidebar from '@/components/DocumentSidebar';
import ChatInterface from '@/components/ChatInterface';

const ORG_ID = 'default-org';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  if (!isLoggedIn) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#09090B]">
        <div className="w-96 p-8 rounded-lg bg-[#1a1a1a] border border-[#333]">
          <h1 className="text-2xl font-bold text-white mb-6">SupportAI</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#333] rounded-lg text-white mb-4"
            onKeyDown={(e) => e.key === 'Enter' && setIsLoggedIn(password === 'demo123')}
          />
          <button
            onClick={() => setIsLoggedIn(password === 'demo123')}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
          {password && password !== 'demo123' && <p className="text-red-400 text-sm mt-2">Wrong password</p>}
          <p className="text-gray-500 text-xs mt-4">Demo password: demo123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#09090B]">
      <DocumentSidebar organizationId={ORG_ID} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-14 border-b border-[#222] flex items-center justify-between px-6 bg-[#0f0f0f]">
          <h1 className="text-sm font-semibold text-gray-300">SupportAI</h1>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
        <ChatInterface organizationId={ORG_ID} />
      </div>
    </div>
  );
}