import { getAllTeams } from '@/lib/db';
import TeamsClient from '@/components/TeamsClient';

export const dynamic = 'force-dynamic';
export default async function TeamsPage() {
  const teams = await getAllTeams();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Teams</p>
          <h1 className="text-2xl font-semibold text-white">All national teams</h1>
        </div>
      </header>

      <section>
        <TeamsClient initial={teams} />
      </section>
    </div>
  );
}
