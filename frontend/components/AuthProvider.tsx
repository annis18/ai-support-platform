'use client';

import { useEffect } from 'react';
import { setAuthToken } from '@/lib/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Simple auth - just set a dummy token
    setAuthToken('demo-token');
  }, []);

  return <>{children}</>;
}