import { prisma } from '@/lib/prismaClient';
import StaffCard from '@/components/StaffCard';

export const dynamic = 'force-dynamic';

const STAFF_ROLES = [
  'RSA | Founders',
  'RSA | Co Founders',
  'RSA | Executive',
  'RSA | Chairman',
  'RSA | Vice Chairman',
  'RSA | Board of Directors',
  'RSA | Director',
  'RSA | Head of Development',
  'RSA | Head Of Staff',
  'RSA | Developer',
  'RSA | Senior Staff',
  'RSA | Staff',
  'RSA | Media',
  'RSA | Panel',
  'RSA | Officials',
];

const DEPARTMENTS: Record<string, string> = {
  'RSA | Founders':            'Executive Leadership',
  'RSA | Co Founders':         'Executive Leadership',
  'RSA | Executive':           'Executive Leadership',
  'RSA | Chairman':            'Board Leadership',
  'RSA | Vice Chairman':       'Board Leadership',
  'RSA | Board of Directors':  'Board Leadership',
  'RSA | Director':            'Administration',
  'RSA | Head of Development': 'Operations',
  'RSA | Head Of Staff':       'Operations',
  'RSA | Developer':           'Operations',
  'RSA | Senior Staff':        'Administration',
  'RSA | Staff':               'Administration',
  'RSA | Media':               'Operations',
  'RSA | Panel':               'Administration',
  'RSA | Officials':           'League Operations',
};

export default async function StaffPage() {
  let users: any[] = [];
  let dbError = false;

  try {
    users = await prisma.user.findMany({
      where: { OR: STAFF_ROLES.map((r: string) => ({ roles: { has: r } })) },
    });
  } catch {
    dbError = true;
  }

  const groups: Record<string, any[]> = {};
  users.forEach((u: any) => {
    const role = (u.roles || []).find((r: string) => STAFF_ROLES.includes(r)) || 'RSA | Staff';
    const dept = DEPARTMENTS[role] || 'Administration';
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push({ user: u, role });
  });

  const deptOrder = ['Executive Leadership', 'Board Leadership', 'Administration', 'Operations', 'League Operations'];
  const sortedGroups = deptOrder
    .filter((d) => groups[d])
    .map((d) => [d, groups[d]] as [string, any[]]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Staff Centre</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">RSA Staff Directory</h1>
        <p className="mt-1 text-sm text-slate-500">Staff detected automatically from Discord roles</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view the staff directory</p>
        </div>
      ) : sortedGroups.length === 0 ? (
        <div className="rounded-2xl border border-rsa-border bg-white/3 px-5 py-12 text-center">
          <p className="text-sm text-slate-400">No staff found in the database</p>
          <p className="mt-1 text-xs text-slate-600">Staff are detected from Discord roles when they log in</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedGroups.map(([dept, members]) => (
            <section key={dept}>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">{dept}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((m: any) => (
                  <StaffCard key={m.user.id} user={m.user} role={m.role} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
