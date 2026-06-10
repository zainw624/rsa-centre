'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { getHighestRole, shortRole } from '@/lib/permissions';
import { Bell, Search, Menu, ChevronDown, User, Shield, LogOut } from 'lucide-react';

const PERM_BADGE: Record<string, { label: string; color: string }> = {
  owner:         { label: 'Owner',        color: 'text-amber-500' },
  administrator: { label: 'League Admin',  color: 'text-primary' },
  league:        { label: 'League Staff',  color: 'text-blue-400' },
  results:       { label: 'Official',      color: 'text-emerald-400' },
  manager:       { label: 'Manager',       color: 'text-purple-400' },
  viewer:        { label: 'Member',        color: 'text-slate-400' },
};

export default function TopNav() {
  const { data: session, status } = useSession();
  const [unread, setUnread]       = useState(0);
  const [userOpen, setUserOpen]   = useState(false);

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

  const perm   = session?.user?.permission ?? 'viewer';
  const badge  = PERM_BADGE[perm] ?? PERM_BADGE.viewer;
  const name   = session?.user?.name ?? 'RSA Member';
  const avatar = session?.user?.image ?? null;

  return (
    <div className="flex items-center justify-between h-16 px-4 border-b border-border/60 bg-card/80 backdrop-blur-xl shrink-0 z-30 sticky top-0">
      {/* Mobile Menu Toggle (placeholder for future implementation) */}
      <div className="lg:hidden flex items-center">
        <button className="p-2 text-muted-foreground hover:text-foreground">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Left: search */}
      <div className="flex-1 min-w-0 flex justify-center lg:justify-start px-4 lg:px-0">
        <form action="/search" method="get" className="flex items-center w-full max-w-md relative group">
          <label htmlFor="tn-q" className="sr-only">Search</label>
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 transition-colors group-focus-within:text-primary" />
          <input
            id="tn-q"
            name="q"
            placeholder="Search players, teams, fixtures…"
            className="w-full bg-background/50 border border-border/80 rounded-xl pl-9 pr-4 py-2 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </form>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notifications */}
        <Link 
          href="/notifications" 
          className="relative p-2 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors border border-transparent hover:border-border/60" 
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </Link>

        {/* User dropdown */}
        {status === 'loading' ? (
          <div className="w-32 h-10 rounded-xl bg-muted animate-pulse" />
        ) : session?.user ? (
          <div className="relative">
            <button
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/50 hover:border-border transition-all group"
              onClick={() => setUserOpen((v) => !v)}
              aria-label="User menu"
            >
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-primary/20 flex items-center justify-center bg-card">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={name}
                    fill sizes="28px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-bold text-primary">
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start min-w-[80px]">
                <span className="text-xs font-semibold text-foreground truncate max-w-[100px] leading-tight">{name}</span>
                <span className={`text-[0.6rem] font-medium uppercase tracking-wider ${badge.color} leading-tight`}>
                  {badge.label}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
            </button>

            {userOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-popover border border-border shadow-xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-primary/30 flex items-center justify-center bg-background">
                        {avatar ? (
                          <Image src={avatar} alt={name} fill sizes="40px" className="object-cover" referrerPolicy="no-referrer" unoptimized />
                        ) : (
                          <span className="text-sm font-bold text-primary">{name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                        <p className={`text-xs font-medium ${badge.color} truncate`}>{badge.label}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {(() => {
                      const top = getHighestRole(session.user.roles ?? []);
                      return top ? (
                        <div className="px-2 mb-2 flex items-center gap-2">
                          <Shield className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">{shortRole(top)}</span>
                        </div>
                      ) : null;
                    })()}
                    
                    <Link 
                      href="/notifications" 
                      className="flex items-center justify-between w-full px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors"
                      onClick={() => setUserOpen(false)}
                    >
                      <span className="flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</span>
                      {unread > 0 && <span className="bg-primary text-primary-foreground text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
                    </Link>
                  </div>
                  
                  <div className="p-2 border-t border-border/50">
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/login" className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-colors">
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
