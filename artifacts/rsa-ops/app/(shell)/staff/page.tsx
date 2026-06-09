import { prisma } from '@/lib/prismaClient';
import StaffCard from '@/components/StaffCard';
import { HIERARCHY, getHighestRole, roleRank, ROLE_DEPARTMENT, DEPARTMENT_ORDER } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  let users: any[] = [];
  let dbError = false;

  try {
    users = await prisma.user.findMany({
      where: { OR: HIERARCHY.map((r) => ({ roles: { has: r } })) },
    });
  } catch {
    dbError = true;
  }

  const groups: Record<string, { user: any; role: string }[]> = {};
  users.forEach((u: any) => {
    const role = getHighestRole(u.roles || []);
    if (!role) return;
    const dept = ROLE_DEPARTMENT[role] || 'Staff';
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push({ user: u, role });
  });

  // Within each department, show the most senior roles first.
  Object.values(groups).forEach((members) =>
    members.sort((a, b) => roleRank(b.role) - roleRank(a.role)),
  );

  const sortedGroups = DEPARTMENT_ORDER
    .filter((d) => groups[d]?.length)
    .map((d) => [d, groups[d]] as [string, { user: any; role: string }[]]);

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
                {members.map((m) => (
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
