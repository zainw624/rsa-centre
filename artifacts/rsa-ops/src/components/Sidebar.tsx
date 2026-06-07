import { Link, useLocation } from 'wouter';

const LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Player Profiles', href: '/player-profiles' },
  { label: 'Teams', href: '/teams' },
  { label: 'Managers', href: '/managers' },
  { label: 'Staff', href: '/staff' },
  { label: 'Rosters', href: '/rosters' },
  { label: 'Transfers', href: '/transfers' },
  { label: 'Discipline', href: '/discipline' },
  { label: 'Fixtures', href: '/fixtures' },
  { label: 'Results', href: '/results' },
  { label: 'World Cup', href: '/world-cup' },
  { label: 'League Table', href: '/league-table' },
  { label: 'Statistics', href: '/statistics' },
  { label: 'Compliance', href: '/compliance' },
  { label: 'Activity', href: '/activity' },
  { label: 'Hall of Fame', href: '/hall-of-fame' },
  { label: 'Awards', href: '/awards' },
  { label: 'Archives', href: '/archives' },
  { label: 'Notifications', href: '/notifications' },
  { label: 'Administration', href: '/administration' },
];

export default function Sidebar() {
  const [location] = useLocation();
  return (
    <div className="h-full w-full p-6" style={{ borderRight: '1px solid rgba(201,165,90,0.12)', background: 'rgba(6,8,12,0.6)' }}>
      <div className="mb-6 flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-lg">
          <img src="/assets/rsa1.png" alt="RSA" className="object-contain w-full h-full" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">RSA</p>
          <p className="text-sm font-semibold text-white">Operations Centre</p>
        </div>
      </div>

      <nav className="space-y-1" role="navigation" aria-label="Primary">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-xl px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-rsa-gold ${
              location === link.href
                ? 'bg-white/10 text-rsa-gold font-medium'
                : 'text-slate-200 hover:bg-white/5'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 pt-4 text-xs text-slate-400" style={{ borderTop: '1px solid rgba(201,165,90,0.12)' }}>
        <p>RSA Operations Centre</p>
        <p className="mt-1 text-sm text-white">Staff Portal</p>
      </div>
    </div>
  );
}
