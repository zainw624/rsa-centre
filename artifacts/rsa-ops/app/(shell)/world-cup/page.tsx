import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StatCard from '@/components/widgets/StatCard';
import StatusCard from '@/components/widgets/StatusCard';
import GroupTabsClient from '@/components/GroupTabsClient';
import {
  getWorldCupOverview,
  getGroupStandings,
  getUpcomingFixtures,
  getLatestResults,
  getCurrentSeason,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function WorldCupPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  let overview: any = { settings: null, cupTiedPlayers: [], activeSanctions: [], totalTeams: 0 };
  let groups: Record<string, any[]> = { A: [], B: [], C: [], D: [] };
  let fixtures: any[] = [];
  let results: any[] = [];
  let season: any = null;
  let dbError = false;

  try {
    [overview, groups, fixtures, results, season] = await Promise.all([
      getWorldCupOverview(),
      getGroupStandings(),
      getUpcomingFixtures(8),
      getLatestResults(8),
      getCurrentSeason(),
    ]);
  } catch {
    dbError = true;
  }

  const { settings, cupTiedPlayers, activeSanctions, totalTeams } = overview;
  const worldCupActive = settings?.worldCupMode ?? false;
  const hasCupTiedRole = Boolean(settings?.cupTiedRoleId);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">World Cup</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">World Cup</h1>
        <p className="mt-1 text-sm text-slate-500">
          {season?.name ? `${season.name} · ` : ''}Groups, standings, fixtures and results — all from the live competition system
        </p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view World Cup data</p>
        </div>
      ) : (
        <>
          {/* ── Status overview ───────────────────────────────────────── */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Season"     value={season?.name ?? '—'} />
            <StatCard title="World Cup Mode"    value={worldCupActive ? 'Active' : 'Inactive'} />
            <StatCard title="Teams"             value={totalTeams} />
            <StatusCard
              title="Roster Lock"
              status={worldCupActive ? 'Locked' : 'Unlocked'}
              hint={worldCupActive ? 'World Cup roster changes are restricted.' : 'Normal roster management is allowed.'}
            />
          </section>

          {/* ── Groups & standings ───────────────────────────────────── */}
          <section className="mt-6">
            <h2 className="mb-4 text-base font-semibold text-white">Groups &amp; Standings</h2>
            <GroupTabsClient groups={groups} />
          </section>

          {/* ── Fixtures & results ───────────────────────────────────── */}
          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            {/* Upcoming fixtures */}
            <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
              <h2 className="mb-4 text-base font-semibold text-white">Upcoming Fixtures</h2>
              {fixtures.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No upcoming fixtures scheduled</p>
              ) : (
                <div className="space-y-2.5">
                  {fixtures.map((f: any) => (
                    <div key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-rsa-border bg-black/20 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <TeamBadge name={f.homeTeam} code={f.homeTeamCode} />
                        <span className="text-xs font-bold text-slate-600">vs</span>
                        <TeamBadge name={f.awayTeam} code={f.awayTeamCode} />
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-slate-300">
                          {new Date(f.kickoff).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          {' · '}
                          {new Date(f.kickoff).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[11px] text-slate-600">{f.competition}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent results */}
            <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
              <h2 className="mb-4 text-base font-semibold text-white">Recent Results</h2>
              {results.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No results recorded yet</p>
              ) : (
                <div className="space-y-2.5">
                  {results.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-rsa-border bg-black/20 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <TeamBadge name={r.homeTeam} />
                        <span className="rounded-md bg-rsa-gold/10 px-2 py-0.5 text-sm font-bold text-rsa-gold">
                          {r.homeScore} – {r.awayScore}
                        </span>
                        <TeamBadge name={r.awayTeam} />
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-slate-400">
                          {new Date(r.matchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[11px] text-slate-600">{r.competition}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Cup-tied enforcement ─────────────────────────────────── */}
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatusCard
              title="Cup-Tied Role"
              status={hasCupTiedRole ? 'Configured' : 'Missing'}
              hint={hasCupTiedRole ? 'Cup tied enforcement can run' : 'Set cup tied role in settings'}
            />
            <div className="rounded-2xl border border-rsa-border bg-white/3 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Cup-Tied Players</p>
              <p className="mt-2 text-3xl font-bold text-white">{cupTiedPlayers.length}</p>
            </div>
            <div className="rounded-2xl border border-rsa-border bg-white/3 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">World Cup Sanctions</p>
              <p className="mt-2 text-3xl font-bold text-white">{activeSanctions.length}</p>
            </div>
          </section>

          {cupTiedPlayers.length > 0 && (
            <section className="mt-5 rounded-2xl border border-rsa-border bg-white/3 p-5">
              <h2 className="mb-4 text-base font-semibold text-white">Cup-Tied Roster Alerts</h2>
              <div className="overflow-x-auto rounded-xl border border-rsa-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rsa-border bg-black/20">
                      {['Player', 'Team', 'Sanction', 'Date'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cupTiedPlayers.map((sanction: any) => (
                      <tr key={sanction.id} className="border-t border-rsa-border">
                        <td className="px-4 py-3 text-white">{sanction.playerTag || sanction.playerId}</td>
                        <td className="px-4 py-3 text-slate-300">{sanction.team ?? 'Unknown'}</td>
                        <td className="px-4 py-3 text-slate-300">{sanction.sanctionType}</td>
                        <td className="px-4 py-3 text-slate-400">{new Date(sanction.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

const FLAG_MAP: Record<string, string> = {
  'united states': 'usa', usa: 'usa', norway: 'norway', croatia: 'croatia', japan: 'japan',
  ghana: 'ghana', 'türkiye': 'turkiye', turkiye: 'turkiye', brazil: 'brazil', belgium: 'belgium',
  portugal: 'portugal', england: 'england', france: 'france', spain: 'spain',
  netherlands: 'netherlands', germany: 'germany', senegal: 'senegal', sweden: 'sweden',
};

function flagFor(name?: string, code?: string): string | null {
  if (code) return `/assets/${code.toLowerCase()}.png`;
  if (!name) return null;
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(FLAG_MAP)) {
    if (key.includes(k)) return `/assets/${v}.png`;
  }
  return null;
}

function TeamBadge({ name, code }: { name?: string; code?: string }) {
  const src = flagFor(name, code);
  return (
    <span className="flex items-center gap-2">
      <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-slate-900">
        {src && <Image src={src} alt={name ?? ''} fill sizes="28px" className="object-contain" />}
      </span>
      <span className="text-sm font-semibold text-white">{name ?? 'Unknown'}</span>
    </span>
  );
}
