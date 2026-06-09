'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

type Perm = 'viewer' | 'manager' | 'results' | 'league' | 'administrator' | 'owner';
const RANK: Record<Perm, number> = {
  viewer: 0, manager: 1, results: 2, league: 3, administrator: 4, owner: 5,
};
function allowed(userPerm: string, min: Perm): boolean {
  return (RANK[userPerm as Perm] ?? 0) >= RANK[min];
}

const NAV: { label: string; href: string; min: Perm; group: string }[] = [
  { label: 'Dashboard',       href: '/dashboard',       min: 'viewer', group: 'main' },
  { label: 'Player Profiles', href: '/player-profiles', min: 'viewer', group: 'league' },
  { label: 'Teams',           href: '/teams',           min: 'viewer', group: 'league' },
  { label: 'Rosters',         href: '/rosters',         min: 'viewer', group: 'league' },
  { label: 'Fixtures',        href: '/fixtures',        min: 'viewer', group: 'league' },
  { label: 'Results',         href: '/results',         min: 'viewer', group: 'league' },
  { label: 'League Table',    href: '/league-table',    min: 'viewer', group: 'league' },
  { label: 'Statistics',      href: '/statistics',      min: 'viewer', group: 'league' },
  { label: 'Transfers',       href: '/transfers',       min: 'viewer', group: 'ops' },
  { label: 'Managers',        href: '/managers',        min: 'viewer', group: 'ops' },
  { label: 'Staff',           href: '/staff',           min: 'viewer', group: 'ops' },
  { label: 'World Cup',       href: '/world-cup',       min: 'viewer', group: 'ops' },
  { label: 'Hall of Fame',    href: '/hall-of-fame',    min: 'viewer', group: 'records' },
  { label: 'Awards',          href: '/awards',          min: 'viewer', group: 'records' },
  { label: 'Archives',        href: '/archives',        min: 'viewer', group: 'records' },
  { label: 'Discipline',      href: '/discipline',      min: 'results',       group: 'manage' },
  { label: 'Compliance',      href: '/compliance',      min: 'league',        group: 'manage' },
  { label: 'Activity',        href: '/activity',        min: 'league',        group: 'manage' },
  { label: 'Administration',  href: '/administration',  min: 'league',        group: 'manage' },
];

const GROUPS: { key: string; label: string }[] = [
  { key: 'main',    label: '' },
  { key: 'league',  label: 'League' },
  { key: 'ops',     label: 'Operations' },
  { key: 'records', label: 'Records' },
  { key: 'manage',  label: 'Management' },
];

const PERM_LABEL: Record<string, string> = {
  owner:         'Owner',
  administrator: 'League Admin',
  league:        'League Staff',
  results:       'Official',
  manager:       'Manager',
  viewer:        'Member',
};
const PERM_COLOR: Record<string, string> = {
  owner:         '#f59e0b',
  administrator: '#c9a55a',
  league:        '#60a5fa',
  results:       '#34d399',
  manager:       '#a78bfa',
  viewer:        '#64748b',
};

export default function Sidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const perm   = session?.user?.permission ?? 'viewer';
  const visible = NAV.filter((i) => allowed(perm, i.min));
  const grouped = GROUPS
    .map((g) => ({ ...g, items: visible.filter((i) => i.group === g.key) }))
    .filter((g) => g.items.length > 0);

  return (
    <aside className="sb-wrap">
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-logo-box">
          <Image src="/assets/rsa1.png" alt="RSA" fill sizes="40px" className="object-contain" />
        </div>
        <div>
          <p className="sb-abbr">RSA</p>
          <p className="sb-title">Operations Centre</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="sb-nav" role="navigation" aria-label="Main navigation">
        {grouped.map((g) => (
          <div key={g.key}>
            {g.label ? <p className="sb-group-label">{g.label}</p> : null}
            {g.items.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? 'sb-link sb-link-active' : 'sb-link'}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="sb-user">
        {status === 'loading' ? (
          <div className="sb-user-skeleton" />
        ) : session?.user ? (
          <>
            <div className="sb-user-left">
              <div className="sb-avatar">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? 'User'}
                    fill sizes="32px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <span className="sb-avatar-initial">
                    {(session.user.name ?? 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="sb-user-meta">
                <p className="sb-user-name">{session.user.name ?? 'RSA Member'}</p>
                <p className="sb-user-role" style={{ color: PERM_COLOR[perm] }}>
                  {PERM_LABEL[perm] ?? 'Member'}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="sb-signout"
              title="Sign out"
              aria-label="Sign out"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      <style>{`
        .sb-wrap {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(201,165,90,0.10);
          background: rgba(5,7,13,0.90);
          overflow: hidden;
        }
        .sb-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.1rem 1rem 0.9rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          flex-shrink: 0;
        }
        .sb-logo-box {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          overflow: hidden;
          border: 1px solid rgba(201,165,90,0.22);
          background: #060d16;
          flex-shrink: 0;
        }
        .sb-abbr {
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          color: #c9a55a;
          text-transform: uppercase;
          margin: 0;
          line-height: 1;
        }
        .sb-title {
          font-size: 0.72rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0.15rem 0 0;
          line-height: 1;
        }
        .sb-nav {
          flex: 1;
          overflow-y: auto;
          padding: 0.625rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 1px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }
        .sb-group-label {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #334155;
          padding: 0.8rem 0.5rem 0.3rem;
          margin: 0;
        }
        .sb-link {
          display: block;
          border-radius: 7px;
          padding: 0.42rem 0.625rem;
          font-size: 0.78rem;
          color: #64748b;
          text-decoration: none;
          transition: background 0.1s, color 0.1s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-link:hover { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .sb-link-active {
          background: rgba(201,165,90,0.10);
          color: #c9a55a;
          font-weight: 600;
        }
        .sb-link-active:hover { background: rgba(201,165,90,0.14); color: #c9a55a; }
        .sb-user {
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 0.75rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          flex-shrink: 0;
          min-height: 58px;
        }
        .sb-user-skeleton {
          height: 32px;
          width: 100%;
          border-radius: 7px;
          background: rgba(255,255,255,0.04);
          animation: sb-pulse 1.4s ease-in-out infinite;
        }
        @keyframes sb-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sb-user-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;
          flex: 1;
        }
        .sb-avatar {
          position: relative;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid rgba(201,165,90,0.22);
          background: #0f1825;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sb-avatar-initial {
          font-size: 0.72rem;
          font-weight: 700;
          color: #c9a55a;
        }
        .sb-user-meta { min-width: 0; flex: 1; }
        .sb-user-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-user-role {
          font-size: 0.66rem;
          margin: 0.1rem 0 0;
          line-height: 1;
        }
        .sb-signout {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px;
          padding: 0.3rem;
          color: #334155;
          cursor: pointer;
          transition: color 0.12s, border-color 0.12s, background 0.12s;
        }
        .sb-signout:hover {
          color: #ef4444;
          border-color: rgba(239,68,68,0.28);
          background: rgba(239,68,68,0.06);
        }
      `}</style>
    </aside>
  );
}
