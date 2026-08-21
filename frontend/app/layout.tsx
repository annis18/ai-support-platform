import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SupportAI | Intelligent Customer Service', 
  description: 'An AI-powered customer support platform using RAG architecture.', 
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