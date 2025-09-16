import type React from 'react';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';
import Link from 'next/link';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mini CRM - Customer Relationship Management',
  description: 'Modern CRM for managing customers, campaigns, and segments',
  generator: 'v0.app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${playfair.variable}`}
      >
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
        <footer>
          <div className="text-center text-sm text-muted-foreground py-4">
            Built with ❤️ by Yuvin Raja for XENO. Access the{' '}
            <Link
              href="https://github.com/yuvinraja/crm-frontend"
              className="text-primary underline"
            >
              Frontend
            </Link>
            . and{' '}
            <Link
              href="https://github.com/yuvinraja/crm-frontend"
              className="text-primary underline"
            >
              Backend
            </Link>
            . source code on GitHub.
          </div>
        </footer>
      </body>
    </html>
  );
}
