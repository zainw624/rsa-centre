import { getAllTeams } from '@/lib/db';
import RostersExplorer from '@/components/RostersExplorer';

export const dynamic = 'force-dynamic';

export default async function RostersPage() {
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
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Rosters</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Team Rosters</h1>
        <p className="mt-1 text-sm text-slate-500">Browse each team&apos;s players, managers and staff</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view roster data</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl border border-rsa-border bg-white/3 px-5 py-12 text-center">
          <p className="text-sm text-slate-400">No teams to display yet</p>
          <p className="mt-1 text-xs text-slate-600">Teams appear here once they are added to the league</p>
        </div>
      ) : (
        <RostersExplorer teams={teams} />
      )}
    </div>
  );
}
