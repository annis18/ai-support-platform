import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Customer Support Platform',
  description: 'AI-powered support assistant with RAG intelligence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}