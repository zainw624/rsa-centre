'use client';

import { signIn } from 'next-auth/react';
import type { ReactNode } from 'react';

export default function LoginButton({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
    >
      {children}
    </button>
  );
}
