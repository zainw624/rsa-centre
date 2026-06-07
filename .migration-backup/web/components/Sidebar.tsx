import Link from 'next/link';
import Image from 'next/image';

const LINKS = [
  'Dashboard',
  'Player Profiles',
  'Teams',
  'Managers',
  'Staff',
  'Rosters',
  'Transfers',
  'Discipline',
  'Fixtures',
  'Results',
  'World Cup',
  'League Table',
  'Statistics',
  'Compliance',
  'Activity',
  'Hall of Fame',
  'Awards',
  'Archives',
  'Administration',
];

export default function Sidebar() {
  return (
    <div className="h-full w-full border-r border-rsa-border bg-[rgba(6,8,12,0.6)] p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-lg">
          <Image src="/assets/rsa1.png" alt="RSA" fill sizes="48px" className="object-contain" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">RSA</p>
          <p className="text-sm font-semibold">Operations Centre</p>
        </div>
      </div>

      <nav className="space-y-1" role="navigation" aria-label="Primary">
        {LINKS.map((label: string) => (
          <Link
            key={label}
            href={`/${label.toLowerCase().replace(/ /g, '-')}`}
            role="menuitem"
            aria-label={`Open ${label}`}
            className="block rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-white/3 focus:outline-none focus:ring-2 focus:ring-rsa-gold">
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 border-t border-rsa-border pt-4 text-xs text-slate-400">
        <p>Signed in as:</p>
        <p className="mt-1 text-sm text-white">RSA Staff</p>
      </div>
    </div>
  );
}
