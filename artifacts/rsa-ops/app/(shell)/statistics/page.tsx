import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StatCard from '@/components/widgets/StatCard';
import { BrandHeader } from '@/components/BrandHeader';
import { getStatisticsSummary, getPlayerLeaderboard, getCurrentSeason } from '@/lib/db';
import type { ReactNode } from 'react';
import { AlertTriangle, Activity, Users, FileText, ArrowRightLeft, ShieldAlert, Goal, Target, ShieldCheck, Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

const EMPTY_STATS = {
  playersCount: 0, teamsCount: 0, managersCount: 0, assistantManagersCount: 0,
  activeSanctionsCount: 0, cupTiedCount: 0, completedTransfersCount: 0,
  pendingTransfersCount: 0, declinedTransfersCount: 0, seasonsCount: 0,
  leagueTableEntriesCount: 0, fixturesCount: 0, resultsCount: 0,
};

const EMPTY_LB: { topScorers: any[]; topAssists: any[]; topCleanSheets: any[]; topMotm: any[] } = { topScorers: [], topAssists: [], topCleanSheets: [], topMotm: [] };

type StatRow = { playerId: string; playerTag: string; team?: { teamName?: string } | null; goals: number; assists: number; cleanSheets: number; motm: number };

function LeaderboardTable({ rows, col, label, icon }: { rows: StatRow[]; col: keyof StatRow; label: string; icon: ReactNode }) {
  return (
    <div className="card-panel overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
        <span className="text-primary">{icon}</span>
        <div>
          <p className="text-sm font-bold text-foreground tracking-tight">{label}</p>
        </div>
      </div>
      
      {rows.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
          <p className="text-sm font-medium text-muted-foreground">No data recorded</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-card border-b border-border text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 w-10">#</th>
                <th className="px-5 py-3 w-1/2">Player</th>
                <th className="px-5 py-3 text-right">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-background">
              {rows.slice(0, 10).map((row, i) => {
                const isTop3 = i < 3;
                const posColor = i === 0 ? 'text-primary bg-primary/10 border-primary/20' : 
                                 i === 1 ? 'text-slate-300 bg-slate-300/10 border-slate-300/20' : 
                                 i === 2 ? 'text-amber-600 bg-amber-600/10 border-amber-600/20' : 
                                 'text-muted-foreground border-transparent';
                
                return (
                  <tr key={row.playerId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded border text-xs font-bold ${posColor}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-foreground truncate">{row.playerTag}</div>
                      <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground truncate">{row.team?.teamName ?? '—'}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-lg text-foreground">
                      {String(row[col])}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  let stats = EMPTY_STATS;
  let leaderboard = EMPTY_LB;
  let dbError = false;
  let season = null;

  try {
    season = await getCurrentSeason();
    [stats, leaderboard] = await Promise.all([
      getStatisticsSummary(),
      getPlayerLeaderboard(season?.id),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <BrandHeader
        title="League Statistics"
        subtitle="Player performance and RSA league metrics"
      />

      {dbError && (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-5 mb-6">
          <div className="flex items-center gap-3 text-amber-500">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Database not connected — showing empty state. Set DATABASE_URL to activate live data.</span>
          </div>
        </div>
      )}

      {/* System overview */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Active Players"      value={stats.playersCount} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Registered Teams"    value={stats.teamsCount} />
        <StatCard title="Managers"            value={stats.managersCount} />
        <StatCard title="Asst. Managers"      value={stats.assistantManagersCount} />
        <StatCard title="Active Sanctions"    value={stats.activeSanctionsCount} icon={<ShieldAlert className="w-5 h-5" />} />
        <StatCard title="Cup-Tied Players"    value={stats.cupTiedCount} />
      </section>

      {/* Player Leaderboards */}
      <section className="mt-8">
        <div className="flex items-center gap-3 border-b border-border/50 pb-2 mb-6">
          <h2 className="text-xl font-bold text-foreground font-display tracking-tight">Player Performance</h2>
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
            Season {season?.name ?? '2026'}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <LeaderboardTable rows={leaderboard.topScorers as StatRow[]} col="goals" label="Top Scorers" icon={<Goal className="w-5 h-5" />} />
          <LeaderboardTable rows={leaderboard.topAssists as StatRow[]} col="assists" label="Top Assists" icon={<Target className="w-5 h-5" />} />
          <LeaderboardTable rows={leaderboard.topCleanSheets as StatRow[]} col="cleanSheets" label="Clean Sheets" icon={<ShieldCheck className="w-5 h-5" />} />
          <LeaderboardTable rows={leaderboard.topMotm as StatRow[]} col="motm" label="Man of the Match" icon={<Trophy className="w-5 h-5" />} />
        </div>
      </section>

      {/* Transfer & League activity */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground font-display">Transfer Activity</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Completed', value: stats.completedTransfersCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Pending',   value: stats.pendingTransfersCount,   color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'Declined',  value: stats.declinedTransfersCount,  color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
            ].map((item) => (
              <div key={item.label} className={`p-4 rounded-xl border ${item.border} ${item.bg} flex flex-col justify-between`}>
                <p className={`text-[0.65rem] font-bold uppercase tracking-wider ${item.color}`}>{item.label}</p>
                <p className={`mt-3 text-3xl font-bold font-display ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground font-display">League Tracking</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Seasons Tracked',         value: stats.seasonsCount },
              { label: 'League Entries',      value: stats.leagueTableEntriesCount },
              { label: 'Fixtures Scheduled',  value: stats.fixturesCount },
              { label: 'Results Recorded',    value: stats.resultsCount },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl border border-border bg-background shadow-sm flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">{item.label}</span>
                <span className="text-lg font-bold font-mono text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
