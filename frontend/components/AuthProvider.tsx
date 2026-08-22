'use client';

import { useEffect } from 'react';

import { setAuthToken } from '@/lib/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    async function syncToken() {
      if (isSignedIn) {
        const token = await getToken();
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
    }
    syncToken();
  }, [isSignedIn, getToken]);

  return <>{children}</>;
}