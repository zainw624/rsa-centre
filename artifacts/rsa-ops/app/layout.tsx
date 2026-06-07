import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'RSA Operations Centre',
  description: 'Private Discord-authenticated operations centre for RSA league management.',
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:26138')
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
