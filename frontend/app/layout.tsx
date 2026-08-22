import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SupportAI',
  description: 'AI-powered customer support platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}