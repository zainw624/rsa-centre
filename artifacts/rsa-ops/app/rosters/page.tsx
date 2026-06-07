import { getAllTeams } from '@/lib/db';
import RosterList from '@/components/RosterList';

export const dynamic = 'force-dynamic';

export default async function RostersPage() {
  const teams = await getAllTeams();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Rosters</p>
        <h1 className="text-2xl font-semibold text-white">Team rosters</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team: any) => (
          <RosterList key={team.id} team={team} />
        ))}
      </section>
    </div>
  );
}
