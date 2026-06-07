import { getAllTeams } from '@/lib/db';
import TeamsClient from '@/components/TeamsClient';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  let teams: any[] = [];
  let dbError = false;

  try {
    teams = await getAllTeams();
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Teams</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">All National Teams</h1>
        <p className="mt-1 text-sm text-slate-500">RSA league teams and their current rosters</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view team data</p>
        </div>
      ) : (
        <section>
          <TeamsClient initial={teams} />
        </section>
      )}
    </div>
  );
}
