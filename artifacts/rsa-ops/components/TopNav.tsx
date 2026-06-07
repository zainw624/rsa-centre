'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

const PERM_BADGE: Record<string, { label: string; color: string }> = {
  owner:         { label: 'Bot Owner',     color: '#f59e0b' },
  administrator: { label: 'Administrator', color: '#c9a55a' },
  league:        { label: 'League Staff',  color: '#60a5fa' },
  results:       { label: 'Official',      color: '#34d399' },
  manager:       { label: 'Manager',       color: '#a78bfa' },
  viewer:        { label: 'Member',        color: '#64748b' },
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
    <div className="tn-bar">
      {/* Left: search */}
      <div className="tn-left">
        <form action="/search" method="get" className="tn-search-form">
          <label htmlFor="tn-q" className="sr-only">Search</label>
          <input
            id="tn-q"
            name="q"
            placeholder="Search players, teams, fixtures…"
            className="tn-search-input"
          />
          <button type="submit" className="tn-search-btn">Search</button>
        </form>
      </div>

      {/* Right: notifications + user */}
      <div className="tn-right">
        {/* Notifications */}
        <Link href="/notifications" className="tn-notif-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a1 1 0 0 0-2 0v1.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0h6Z" />
          </svg>
          {unread > 0 && (
            <span className="tn-notif-badge">{unread > 9 ? '9+' : unread}</span>
          )}
        </Link>

        {/* User dropdown */}
        {status === 'loading' ? (
          <div className="tn-user-skeleton" />
        ) : session?.user ? (
          <div className="tn-user-wrap">
            <button
              className="tn-user-btn"
              onClick={() => setUserOpen((v) => !v)}
              aria-label="User menu"
            >
              <div className="tn-user-avatar">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={name}
                    fill sizes="32px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <span className="tn-user-initial">
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="tn-user-info">
                <span className="tn-user-name">{name}</span>
                <span className="tn-user-role" style={{ color: badge.color }}>
                  {badge.label}
                </span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" className="tn-chevron" style={{ opacity: 0.4 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {userOpen && (
              <div className="tn-dropdown">
                <div className="tn-dropdown-header">
                  <div className="tn-dd-avatar">
                    {avatar ? (
                      <Image src={avatar} alt={name} fill sizes="40px" className="object-cover" referrerPolicy="no-referrer" unoptimized />
                    ) : (
                      <span className="tn-dd-initial">{name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="tn-dd-name">{name}</p>
                    <p className="tn-dd-role" style={{ color: badge.color }}>{badge.label}</p>
                  </div>
                </div>
                {session.user.roles?.length > 0 && (
                  <div className="tn-dd-roles">
                    {session.user.roles.slice(0, 4).map((r: string) => (
                      <span key={r} className="tn-dd-role-pill">{r.replace('RSA | ', '')}</span>
                    ))}
                  </div>
                )}
                <div className="tn-dd-divider" />
                <Link href="/notifications" className="tn-dd-item" onClick={() => setUserOpen(false)}>
                  Notifications {unread > 0 && <span className="tn-dd-count">{unread}</span>}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="tn-dd-item tn-dd-signout"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="tn-signin-btn">Sign in</Link>
        )}
      </div>

      <style>{`
        .tn-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(201,165,90,0.08);
          background: rgba(5,7,13,0.70);
          backdrop-filter: blur(8px);
          padding: 0 1rem;
          height: 52px;
          gap: 1rem;
          flex-shrink: 0;
        }
        .tn-left { flex: 1; min-width: 0; }
        .tn-search-form {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          max-width: 420px;
        }
        .tn-search-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 0.35rem 0.75rem;
          font-size: 0.8rem;
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.15s;
        }
        .tn-search-input::placeholder { color: #334155; }
        .tn-search-input:focus { border-color: rgba(201,165,90,0.35); }
        .tn-search-btn {
          background: rgba(201,165,90,0.10);
          border: 1px solid rgba(201,165,90,0.22);
          border-radius: 7px;
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #c9a55a;
          cursor: pointer;
          transition: background 0.12s;
          white-space: nowrap;
        }
        .tn-search-btn:hover { background: rgba(201,165,90,0.18); }
        .tn-right {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-shrink: 0;
        }
        .tn-notif-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          color: #64748b;
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .tn-notif-btn:hover { background: rgba(255,255,255,0.07); color: #e2e8f0; }
        .tn-notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 16px;
          height: 16px;
          background: #c9a55a;
          color: #0a0c10;
          font-size: 0.58rem;
          font-weight: 700;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
        }
        .tn-user-skeleton {
          width: 120px;
          height: 34px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          animation: tn-pulse 1.4s ease-in-out infinite;
        }
        @keyframes tn-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .tn-user-wrap { position: relative; }
        .tn-user-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 9px;
          padding: 0.3rem 0.625rem 0.3rem 0.3rem;
          cursor: pointer;
          transition: background 0.12s, border-color 0.12s;
        }
        .tn-user-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(201,165,90,0.18);
        }
        .tn-user-avatar {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid rgba(201,165,90,0.22);
          background: #0f1825;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tn-user-initial {
          font-size: 0.7rem;
          font-weight: 700;
          color: #c9a55a;
        }
        .tn-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0;
        }
        .tn-user-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }
        .tn-user-role {
          font-size: 0.62rem;
          line-height: 1;
          white-space: nowrap;
        }
        .tn-chevron { flex-shrink: 0; }
        /* Dropdown */
        .tn-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 220px;
          background: #0d1520;
          border: 1px solid rgba(201,165,90,0.14);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          z-index: 100;
          overflow: hidden;
          animation: tn-dropdown-in 0.12s ease-out;
        }
        @keyframes tn-dropdown-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tn-dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.875rem 0.875rem 0.75rem;
        }
        .tn-dd-avatar {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid rgba(201,165,90,0.25);
          background: #0f1825;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tn-dd-initial {
          font-size: 0.9rem;
          font-weight: 700;
          color: #c9a55a;
        }
        .tn-dd-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0;
          line-height: 1.2;
        }
        .tn-dd-role {
          font-size: 0.72rem;
          margin: 0.15rem 0 0;
          line-height: 1;
        }
        .tn-dd-roles {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          padding: 0 0.875rem 0.75rem;
        }
        .tn-dd-role-pill {
          font-size: 0.62rem;
          font-weight: 600;
          color: #94a3b8;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 999px;
          padding: 0.1rem 0.5rem;
          white-space: nowrap;
        }
        .tn-dd-divider { height: 1px; background: rgba(255,255,255,0.05); }
        .tn-dd-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-size: 0.8rem;
          color: #94a3b8;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s, color 0.1s;
        }
        .tn-dd-item:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
        .tn-dd-count {
          font-size: 0.65rem;
          background: #c9a55a;
          color: #0a0c10;
          border-radius: 999px;
          padding: 0.05rem 0.35rem;
          font-weight: 700;
        }
        .tn-dd-signout:hover { color: #ef4444; background: rgba(239,68,68,0.05); }
        .tn-signin-btn {
          font-size: 0.8rem;
          font-weight: 600;
          color: #c9a55a;
          background: rgba(201,165,90,0.08);
          border: 1px solid rgba(201,165,90,0.22);
          border-radius: 8px;
          padding: 0.35rem 0.875rem;
          text-decoration: none;
          transition: background 0.12s;
        }
        .tn-signin-btn:hover { background: rgba(201,165,90,0.16); }
      `}</style>
    </div>
  );
}
