'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TopNav() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications?unreadOnly=true');
        if (!res.ok) return;
        const list = await res.json();
        setUnread(Array.isArray(list) ? list.length : 0);
      } catch {
        setUnread(0);
      }
    };
    fetchUnread();
  }, []);

  return (
    <div className="flex items-center justify-between border-b border-rsa-border bg-[rgba(255,255,255,0.02)] px-4 py-3">
      <div className="flex items-center gap-4">
        <Link href="/search" className="hidden rounded-md bg-white/3 px-3 py-2 text-sm text-white md:inline">Search</Link>
        <div className="text-sm text-slate-300">Overview</div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <form action="/search" method="get" className="hidden flex-1 items-center gap-3 md:flex">
          <label htmlFor="top-nav-search" className="sr-only">Search</label>
          <input
            name="q"
            id="top-nav-search"
            placeholder="Search players, teams, fixtures..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20"
          />
          <button type="submit" className="rounded-2xl bg-rsa-gold px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-yellow-400">
            Go
          </button>
        </form>

        <Link href="/notifications" className="relative rounded-full p-2 text-slate-200 transition hover:bg-white/10">
          <span className="sr-only">Notifications</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a1 1 0 0 0-2 0v1.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0h6Z" />
          </svg>
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-rsa-gold px-1.5 text-[0.65rem] font-semibold text-slate-950">
              {unread}
            </span>
          ) : null}
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Signed in</div>
            <div className="text-sm font-semibold text-white">RSA Operations</div>
          </div>
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-rsa-border">
            <Image src="/assets/rsa1.png" alt="RSA" fill sizes="36px" className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
