'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LogOut, Home, Users, Flag, UsersRound, Calendar, FileBarChart2, Activity, ListOrdered, GraduationCap, ShieldAlert, Archive, FileCheck2, Settings, Trophy, Replace } from 'lucide-react';

type Perm = 'viewer' | 'manager' | 'results' | 'league' | 'administrator' | 'owner';
const RANK: Record<Perm, number> = {
  viewer: 0, manager: 1, results: 2, league: 3, administrator: 4, owner: 5,
};
function allowed(userPerm: string, min: Perm): boolean {
  return (RANK[userPerm as Perm] ?? 0) >= RANK[min];
}

const NAV: { label: string; href: string; min: Perm; group: string; icon: any }[] = [
  { label: 'Dashboard',       href: '/dashboard',       min: 'viewer', group: 'main', icon: Home },
  { label: 'Player Profiles', href: '/player-profiles', min: 'viewer', group: 'league', icon: Users },
  { label: 'Teams',           href: '/teams',           min: 'viewer', group: 'league', icon: Flag },
  { label: 'Rosters',         href: '/rosters',         min: 'viewer', group: 'league', icon: UsersRound },
  { label: 'Fixtures',        href: '/fixtures',        min: 'viewer', group: 'league', icon: Calendar },
  { label: 'Results',         href: '/results',         min: 'viewer', group: 'league', icon: FileBarChart2 },
  { label: 'League Table',    href: '/league-table',    min: 'viewer', group: 'league', icon: ListOrdered },
  { label: 'Statistics',      href: '/statistics',      min: 'viewer', group: 'league', icon: Activity },
  { label: 'Transfers',       href: '/transfers',       min: 'viewer', group: 'ops', icon: Replace },
  { label: 'Managers',        href: '/managers',        min: 'viewer', group: 'ops', icon: GraduationCap },
  { label: 'Staff',           href: '/staff',           min: 'viewer', group: 'ops', icon: ShieldAlert },
  { label: 'World Cup',       href: '/world-cup',       min: 'viewer', group: 'ops', icon: Trophy },
  { label: 'Hall of Fame',    href: '/hall-of-fame',    min: 'viewer', group: 'records', icon: Trophy },
  { label: 'Awards',          href: '/awards',          min: 'viewer', group: 'records', icon: Trophy },
  { label: 'Archives',        href: '/archives',        min: 'viewer', group: 'records', icon: Archive },
  { label: 'Discipline',      href: '/discipline',      min: 'results',       group: 'manage', icon: ShieldAlert },
  { label: 'Compliance',      href: '/compliance',      min: 'league',        group: 'manage', icon: FileCheck2 },
  { label: 'Activity',        href: '/activity',        min: 'league',        group: 'manage', icon: Activity },
  { label: 'Administration',  href: '/administration',  min: 'league',        group: 'manage', icon: Settings },
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
  owner:         'text-amber-500',
  administrator: 'text-primary',
  league:        'text-blue-400',
  results:       'text-emerald-400',
  manager:       'text-purple-400',
  viewer:        'text-slate-400',
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
    <aside className="flex flex-col h-full w-full bg-card border-r border-border/60">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/40 shrink-0">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-background border border-primary/20 flex items-center justify-center shrink-0">
          <Image src="/assets/rsa1.png" alt="RSA" fill sizes="40px" className="object-contain p-1" />
        </div>
        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.2em] text-primary uppercase leading-tight">RSA</p>
          <p className="text-sm font-semibold text-foreground leading-tight mt-0.5 font-display">Operations Centre</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
        {grouped.map((g) => (
          <div key={g.key} className="space-y-1">
            {g.label && (
              <p className="px-3 mb-2 text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground">
                {g.label}
              </p>
            )}
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'opacity-70'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border/40 shrink-0">
        {status === 'loading' ? (
          <div className="h-12 w-full rounded-xl bg-muted animate-pulse" />
        ) : session?.user ? (
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl border border-border/40 bg-muted/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/20 bg-background shrink-0 flex items-center justify-center">
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
                  <span className="text-xs font-bold text-primary">
                    {(session.user.name ?? 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {session.user.name ?? 'RSA Member'}
                </p>
                <p className={`text-[0.65rem] font-medium uppercase tracking-wider ${PERM_COLOR[perm] || 'text-muted-foreground'} truncate`}>
                  {PERM_LABEL[perm] ?? 'Member'}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
