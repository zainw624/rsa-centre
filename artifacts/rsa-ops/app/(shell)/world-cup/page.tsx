import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StatCard from '@/components/widgets/StatCard';
import StatusCard from '@/components/widgets/StatusCard';
import GroupTabsClient from '@/components/GroupTabsClient';
import { BrandHeader } from '@/components/BrandHeader';
import {
  getWorldCupOverview,
  getGroupStandings,
  getUpcomingFixtures,
  getLatestResults,
  getCurrentSeason,
} from '@/lib/db';
import { AlertCircle, CalendarDays, Lock, Trophy } from 'lucide-react';

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
    <div className="space-y-6">
      <BrandHeader
        title="World Cup"
        subtitle={`${season?.name ? `${season.name} · ` : ''}Groups, standings, fixtures and results`}
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view World Cup data</p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Season"     value={season?.name ?? '—'} icon={<Trophy className="w-5 h-5"/>} />
            <StatusCard
              title="World Cup Mode"
              status={worldCupActive ? 'Active' : 'Inactive'}
            />
            <StatCard title="Teams"             value={totalTeams} />
            <StatusCard
              title="Roster Lock"
              status={worldCupActive ? 'Locked' : 'Unlocked'}
              hint={worldCupActive ? 'World Cup roster changes are restricted.' : 'Normal roster management is allowed.'}
            />
          </section>

          <section className="mt-6">
            <div className="flex items-center gap-3 border-b border-border/50 pb-2 mb-4">
              <h2 className="text-lg font-bold text-foreground font-display tracking-tight">Groups & Standings</h2>
            </div>
            <GroupTabsClient groups={groups} />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="card-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground font-display">Upcoming Fixtures</h2>
              </div>
              {fixtures.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No upcoming fixtures scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fixtures.map((f: any) => (
                    <div key={f.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <TeamBadge name={f.homeTeam} code={f.homeTeamCode} />
                        <span className="text-[0.65rem] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">VS</span>
                        <TeamBadge name={f.awayTeam} code={f.awayTeamCode} />
                      </div>
                      <div className="text-right sm:text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">
                          {new Date(f.kickoff).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          {' · '}
                          <span className="text-primary">{new Date(f.kickoff).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{f.competition}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground font-display">Recent Results</h2>
              </div>
              {results.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No results recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r: any) => (
                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <TeamBadge name={r.homeTeam} />
                        <span className="px-3 py-1 rounded bg-primary/10 border border-primary/20 text-sm font-bold text-primary font-mono">
                          {r.homeScore} - {r.awayScore}
                        </span>
                        <TeamBadge name={r.awayTeam} />
                      </div>
                      <div className="text-right sm:text-right shrink-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          {new Date(r.matchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{r.competition}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatusCard
              title="Cup-Tied Role"
              status={hasCupTiedRole ? 'Configured' : 'Missing'}
              hint={hasCupTiedRole ? 'Cup tied enforcement can run' : 'Set cup tied role in settings'}
            />
            <div className="card-panel p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Cup-Tied Players</p>
                <Lock className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <p className="text-3xl font-bold text-foreground font-display tracking-tight">{cupTiedPlayers.length}</p>
            </div>
            <div className="card-panel p-5 flex flex-col justify-between border-destructive/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-destructive">World Cup Sanctions</p>
                <AlertCircle className="w-4 h-4 text-destructive/50" />
              </div>
              <p className="text-3xl font-bold text-destructive font-display tracking-tight">{activeSanctions.length}</p>
            </div>
          </section>

          {cupTiedPlayers.length > 0 && (
            <section className="card-panel p-6 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground font-display">Cup-Tied Roster Alerts</h2>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-muted border-b border-border text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3 w-1/3">Player</th>
                      <th className="px-5 py-3 w-1/4">Team</th>
                      <th className="px-5 py-3 w-1/4">Sanction</th>
                      <th className="px-5 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-background">
                    {cupTiedPlayers.map((sanction: any) => (
                      <tr key={sanction.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-bold text-foreground">{sanction.playerTag || sanction.playerId}</td>
                        <td className="px-5 py-3 font-medium text-muted-foreground">{sanction.team ?? 'Unknown'}</td>
                        <td className="px-5 py-3">
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                            {sanction.sanctionType}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                          {new Date(sanction.createdAt).toLocaleDateString()}
                        </td>
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
  netherlands: 'netherlands', germany: 'germany', senegal: 'senegal', morocco: 'morocco',
};

function flagFor(name?: string, code?: string): string | null {
  if (name) {
    const key = name.toLowerCase();
    for (const [k, v] of Object.entries(FLAG_MAP)) {
      if (key.includes(k)) return `/assets/${v}.png`;
    }
  }
  if (code) return `/assets/${code.toLowerCase()}.png`;
  return null;
}

function TeamBadge({ name, code }: { name?: string; code?: string }) {
  const src = flagFor(name, code);
  return (
    <span className="flex items-center gap-3">
      <span className="relative w-8 h-8 shrink-0 overflow-hidden rounded-lg bg-background border border-border shadow-sm flex items-center justify-center p-1">
        {src ? (
          <Image src={src} alt={name ?? ''} fill sizes="32px" className="object-contain" />
        ) : (
          <span className="w-full h-full bg-muted rounded-[2px]" />
        )}
      </span>
      <span className="text-sm font-bold text-foreground truncate max-w-[120px]">{name ?? 'Unknown'}</span>
    </span>
  );
}
