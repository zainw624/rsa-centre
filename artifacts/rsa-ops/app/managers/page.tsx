import ManagerCard from '@/components/ManagerCard';
import { getManagerAssignmentsFromRoles } from '@/lib/db';

export const dynamic = 'force-dynamic';
export default async function ManagersPage() {
  const derived = await getManagerAssignmentsFromRoles();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Managers</p>
        <h1 className="text-2xl font-semibold text-white">Team managers & assistants</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {derived.map((a: any, idx: number) => (
          <ManagerCard key={`${a.user.id}-${a.team.id}-${idx}`} assignment={{ user: a.user, team: a.team, role: a.role }} />
        ))}
      </section>
    </div>
  );
}
