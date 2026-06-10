import { prisma } from '@/lib/prismaClient';
import StaffCard from '@/components/StaffCard';
import { HIERARCHY, getHighestRole, roleRank, ROLE_DEPARTMENT, DEPARTMENT_ORDER } from '@/lib/permissions';
import { BrandHeader } from '@/components/BrandHeader';
import { ShieldAlert } from 'lucide-react';

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
    <div className="space-y-6">
      <BrandHeader
        title="League Operations Staff"
        subtitle="The people who run the league, organised by department"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view the staff directory</p>
        </div>
      ) : sortedGroups.length === 0 ? (
        <div className="card-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground font-display">No staff members found</p>
          <p className="mt-1 text-sm text-muted-foreground font-medium">Staff members will appear here once they log in</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedGroups.map(([dept, members]) => (
            <section key={dept}>
              <div className="flex items-center gap-3 mb-5 border-b border-border/50 pb-2">
                <h2 className="text-base font-bold text-foreground font-display tracking-tight">{dept}</h2>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">
                  {members.length} members
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
