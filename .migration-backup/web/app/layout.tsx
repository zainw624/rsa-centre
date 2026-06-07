import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';
import LayoutShell from '@/components/LayoutShell';

export const metadata: Metadata = {
  title: 'RSA Operations Centre',
  description: 'Private Discord-authenticated operations centre for RSA league management.',
  metadataBase: new URL('http://localhost:3000')
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
