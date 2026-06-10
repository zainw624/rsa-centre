import ManagerCard from '@/components/ManagerCard';
import { getManagerAssignmentsFromRoles } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ManagersPage() {
  let derived: any[] = [];
  let dbError = false;

  try {
    derived = await getManagerAssignmentsFromRoles();
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Management Team</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Team Managers & Assistants</h1>
        <p className="mt-1 text-sm text-slate-500">The managers and assistant managers currently leading each team</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view manager assignments</p>
        </div>
      ) : derived.length === 0 ? (
        <div className="rounded-2xl border border-rsa-border bg-white/3 px-5 py-12 text-center">
          <p className="text-sm text-slate-400">No active managers to display yet</p>
          <p className="mt-1 text-xs text-slate-600">Managers appear here once they are assigned to a team</p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {derived.map((a: any, idx: number) => (
            <ManagerCard
              key={`${a.user.id}-${a.team.id}-${idx}`}
              assignment={{ user: a.user, team: a.team, role: a.role }}
            />
          ))}
        </section>
      )}
    </div>
  );
}
