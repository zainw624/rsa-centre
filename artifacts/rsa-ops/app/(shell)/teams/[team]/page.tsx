import { getTeamByCodeOrName } from '@/lib/db';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

function computeRecord(team: any) {
  let won = 0, drew = 0, lost = 0, goalsFor = 0, goalsAgainst = 0;
  for (const r of team.results ?? []) {
    const isHome = r.homeTeam === team.teamName || r.homeTeam === team.teamCode;
    const isAway = r.awayTeam === team.teamName || r.awayTeam === team.teamCode;
    if (!isHome && !isAway) continue;
    const us = isHome ? r.homeScore : r.awayScore;
    const them = isHome ? r.awayScore : r.homeScore;
    goalsFor += us;
    goalsAgainst += them;
    if (us > them) won++;
    else if (us === them) drew++;
    else lost++;
  }
  const played = won + drew + lost;
  return { played, won, drew, lost, goalsFor, goalsAgainst, goalDifference: goalsFor - goalsAgainst, points: won * 3 + drew };
}

export default async function TeamDetail({ params }: { params: Promise<{ team: string }> }) {
  const resolvedParams = await params;
  const team = await getTeamByCodeOrName(resolvedParams.team) as any;
  if (!team) return <div className="text-white">Team not found</div>;

  const manager = team.managerAssignments?.find((m: any) => m.role === 'manager')?.user;
  const assistant = team.managerAssignments?.find((m: any) => m.role === 'assistant')?.user;
  const otherStaff = (team.managerAssignments ?? []).filter((m: any) => m.role !== 'manager' && m.role !== 'assistant');

  // Prefer the official league-table record; fall back to one computed from results.
  const tableEntry = team.leagueTableEntries?.[0];
  const record = tableEntry
    ? {
        played: tableEntry.played, won: tableEntry.won, drew: tableEntry.drew, lost: tableEntry.lost,
        goalsFor: tableEntry.goalsFor, goalsAgainst: tableEntry.goalsAgainst,
        goalDifference: tableEntry.goalDifference, points: tableEntry.points,
      }
    : computeRecord(team);

  const roster = team.rosterPlayers ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="card mb-6 flex items-center gap-6 rounded-3xl border border-rsa-border p-6">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          <Image src={team.logo || `/assets/${(team.teamCode || team.teamName).toLowerCase()}.png`} alt={team.teamName} fill sizes="80px" className="object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">{team.teamName}</h1>
          {team.group ? <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-rsa-gold">Group {team.group}</div> : null}
          <div className="mt-2 text-sm text-slate-300">Manager: {manager?.name ?? '—'}</div>
          <div className="text-sm text-slate-300">Assistant Manager: {assistant?.name ?? '—'}</div>
          <div className="mt-2 text-sm text-slate-300">Players: {roster.length}/{team.rosterLimit}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="card rounded-2xl border border-rsa-border p-4">
            <h2 className="text-white">Full Roster</h2>
            {roster.length ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {roster.map((r: any) => (
                  <li key={r.id}>{r.playerTag}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No players on this roster yet.</p>
            )}
          </section>

          <section className="card rounded-2xl border border-rsa-border p-4">
            <h2 className="text-white">Recent Results</h2>
            {team.results?.length ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {team.results.slice(0, 5).map((res: any) => (
                  <li key={res.id}>{res.homeTeam} {res.homeScore} - {res.awayScore} {res.awayTeam} <span className="text-xs text-slate-500">({new Date(res.matchDate).toLocaleDateString()})</span></li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No results recorded yet.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card rounded-2xl border border-rsa-border p-4">
            <h3 className="text-sm font-semibold text-white">Management</h3>
            <div className="mt-3 space-y-1.5 text-sm text-slate-300">
              <div className="flex justify-between"><span className="text-slate-500">Manager</span><span>{manager?.name ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Assistant</span><span>{assistant?.name ?? '—'}</span></div>
            </div>
            {otherStaff.length ? (
              <div className="mt-3 border-t border-rsa-border pt-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Staff</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  {otherStaff.map((s: any) => (
                    <li key={s.id} className="flex justify-between"><span>{s.user?.name ?? '—'}</span><span className="text-xs text-slate-500">{s.role}</span></li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="card rounded-2xl border border-rsa-border p-4">
            <h3 className="text-sm font-semibold text-white">Team Record</h3>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div><div className="text-lg font-semibold text-white">{record.won}</div><div className="text-xs text-slate-500">Won</div></div>
              <div><div className="text-lg font-semibold text-white">{record.drew}</div><div className="text-xs text-slate-500">Drawn</div></div>
              <div><div className="text-lg font-semibold text-white">{record.lost}</div><div className="text-xs text-slate-500">Lost</div></div>
            </div>
          </section>

          <section className="card rounded-2xl border border-rsa-border p-4">
            <h3 className="text-sm font-semibold text-white">Statistics</h3>
            <div className="mt-3 space-y-1.5 text-sm text-slate-300">
              <div className="flex justify-between"><span className="text-slate-500">Matches Played</span><span>{record.played}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Goals For</span><span>{record.goalsFor}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Goals Against</span><span>{record.goalsAgainst}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Goal Difference</span><span>{record.goalDifference > 0 ? '+' : ''}{record.goalDifference}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Points</span><span className="font-medium text-white">{record.points}</span></div>
            </div>
          </section>

          <section className="card rounded-2xl border border-rsa-border p-4">
            <h3 className="text-sm font-semibold text-white">Upcoming Fixtures</h3>
            {team.fixtures?.length ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {team.fixtures.map((f: any) => (
                  <li key={f.id}>{f.homeTeam} vs {f.awayTeam} <span className="text-xs text-slate-500">— {new Date(f.kickoff).toLocaleString()}</span></li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No upcoming fixtures.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
