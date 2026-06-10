import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontDisplay = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'RSA Operations Centre',
  description: 'Private Discord-authenticated operations centre for RSA league management.',
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:26138')
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} dark`}>
      <body className="font-sans antialiased text-foreground bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
