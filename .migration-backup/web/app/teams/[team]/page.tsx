import { getTeamByCodeOrName } from '@/lib/db';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export default async function TeamDetail({ params }: { params: Promise<{ team: string }> }) {
  const resolvedParams = await params;
  const lookup = resolvedParams.team;
  const team = await getTeamByCodeOrName(lookup) as any;
  if (!team) return <div className="text-white">Team not found</div>;

  const manager = team.managerAssignments?.find((m: any) => m.role === 'manager')?.user;
  const assistant = team.managerAssignments?.find((m: any) => m.role === 'assistant')?.user;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="card mb-6 flex items-center gap-6 rounded-3xl border border-rsa-border p-6">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          <Image src={team.logo || `/assets/${(team.teamCode||team.teamName).toLowerCase()}.png`} alt={team.teamName} fill sizes="80px" className="object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">{team.teamName}</h1>
          <div className="mt-2 text-sm text-slate-300">Manager: {manager ? manager.name ?? manager.discordId : '—'}</div>
          <div className="text-sm text-slate-300">Assistant: {assistant ? assistant.name ?? assistant.discordId : '—'}</div>
          <div className="mt-2 text-sm text-slate-300">Roster: {team.rosterPlayers?.length ?? 0}/{team.rosterLimit}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="card rounded-2xl border border-rsa-border p-4">
            <h2 className="text-white">Full roster</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {team.rosterPlayers.map((r: any) => (
                <li key={r.id}>{r.playerTag} ({r.playerId})</li>
              ))}
            </ul>
          </section>

          <section className="card rounded-2xl border border-rsa-border p-4">
            <h2 className="text-white">Recent Transfers</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {team.results.slice(0,5).map((res: any) => (
                <li key={res.id}>{res.homeTeam} {res.homeScore} - {res.awayScore} {res.awayTeam} ({new Date(res.matchDate).toLocaleDateString()})</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card rounded-2xl border border-rsa-border p-4">
            <h3 className="text-sm text-slate-400">Upcoming Fixtures</h3>
            <ul className="mt-3 text-sm text-slate-300">
              {team.fixtures.map((f: any) => (
                <li key={f.id}>{f.homeTeam} vs {f.awayTeam} — {new Date(f.kickoff).toLocaleString()}</li>
              ))}
            </ul>
          </section>

          <section className="card rounded-2xl border border-rsa-border p-4">
            <h3 className="text-sm text-slate-400">Statistics</h3>
            <div className="mt-2 text-sm text-slate-300">Matches: {team.results.length}</div>
          </section>
        </aside>
      </div>
    </div>
  );
}
