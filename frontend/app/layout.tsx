import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SupportAI',
  description: 'AI-powered customer support platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}