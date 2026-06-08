import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StatCard from '@/components/widgets/StatCard';
import { getStatisticsSummary, getPlayerLeaderboard, getCurrentSeason } from '@/lib/db';

export const dynamic = 'force-dynamic';

const EMPTY_STATS = {
  playersCount: 0, teamsCount: 0, managersCount: 0, assistantManagersCount: 0,
  activeSanctionsCount: 0, cupTiedCount: 0, completedTransfersCount: 0,
  pendingTransfersCount: 0, declinedTransfersCount: 0, seasonsCount: 0,
  leagueTableEntriesCount: 0, fixturesCount: 0, resultsCount: 0,
};

const EMPTY_LB: { topScorers: any[]; topAssists: any[]; topCleanSheets: any[]; topMotm: any[] } = { topScorers: [], topAssists: [], topCleanSheets: [], topMotm: [] };

type StatRow = { playerId: string; playerTag: string; team?: { teamName?: string } | null; goals: number; assists: number; cleanSheets: number; motm: number };

function LeaderboardTable({ rows, col, label }: { rows: StatRow[]; col: keyof StatRow; label: string }) {
  if (!rows.length) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-slate-600">No data — submit stats via bot</div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(201,165,90,0.12)', background: 'rgba(0,0,0,0.25)' }}>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-rsa-gold">#</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-rsa-gold">Player</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-rsa-gold">Team</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-rsa-gold">{label}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.playerId}
              style={{
                borderTop: '1px solid rgba(201,165,90,0.07)',
                background: i % 2 === 0 ? 'rgba(201,165,90,0.02)' : 'rgba(0,0,0,0.14)',
              }}
            >
              <td className="px-4 py-3" style={{ color: i === 0 ? '#c9a55a' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#475569', fontWeight: i < 3 ? 700 : 400 }}>
                {i + 1}
              </td>
              <td className="px-4 py-3 font-medium text-white">{row.playerTag}</td>
              <td className="px-4 py-3 text-slate-400">{row.team?.teamName ?? '—'}</td>
              <td className="px-4 py-3 text-right font-bold text-white">{String(row[col])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  let stats = EMPTY_STATS;
  let leaderboard = EMPTY_LB;
  let dbError = false;

  try {
    const season = await getCurrentSeason();
    [stats, leaderboard] = await Promise.all([
      getStatisticsSummary(),
      getPlayerLeaderboard(season?.id),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Statistics</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">League Statistics</h1>
        <p className="mt-1 text-sm text-slate-500">Player performance and RSA league metrics</p>
      </header>

      {dbError && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-4 text-sm text-amber-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Database not connected — showing empty state. Set <code className="rounded bg-black/30 px-1 text-xs">DATABASE_URL</code> to activate live data.</span>
        </div>
      )}

      {/* System overview */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Active Players"      value={stats.playersCount} />
        <StatCard title="Registered Teams"    value={stats.teamsCount} />
        <StatCard title="Assigned Managers"   value={stats.managersCount} />
        <StatCard title="Assistant Managers"  value={stats.assistantManagersCount} />
        <StatCard title="Active Sanctions"    value={stats.activeSanctionsCount} />
        <StatCard title="Cup-Tied Players"    value={stats.cupTiedCount} />
      </section>

      {/* Player Leaderboards */}
      <section className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Player Performance</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Leaderboards</h2>
          <p className="text-xs text-slate-500 mt-0.5">Season 2026 · Updated automatically from bot submissions</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Top Scorers */}
          <div className="overflow-hidden rounded-2xl border border-rsa-border" style={{ background: 'rgba(14,10,3,0.88)' }}>
            <div className="border-b border-rsa-border bg-black/25 px-5 py-4 flex items-center gap-2">
              <span style={{ fontSize: '1.1rem' }}>⚽</span>
              <div>
                <p className="text-sm font-semibold text-white">Top Scorers</p>
                <p className="text-xs text-slate-500">Most goals scored</p>
              </div>
            </div>
            <LeaderboardTable rows={leaderboard.topScorers as StatRow[]} col="goals" label="Goals" />
          </div>

          {/* Top Assists */}
          <div className="overflow-hidden rounded-2xl border border-rsa-border" style={{ background: 'rgba(14,10,3,0.88)' }}>
            <div className="border-b border-rsa-border bg-black/25 px-5 py-4 flex items-center gap-2">
              <span style={{ fontSize: '1.1rem' }}>🎯</span>
              <div>
                <p className="text-sm font-semibold text-white">Top Assists</p>
                <p className="text-xs text-slate-500">Most assists provided</p>
              </div>
            </div>
            <LeaderboardTable rows={leaderboard.topAssists as StatRow[]} col="assists" label="Assists" />
          </div>

          {/* Clean Sheets */}
          <div className="overflow-hidden rounded-2xl border border-rsa-border" style={{ background: 'rgba(14,10,3,0.88)' }}>
            <div className="border-b border-rsa-border bg-black/25 px-5 py-4 flex items-center gap-2">
              <span style={{ fontSize: '1.1rem' }}>🧤</span>
              <div>
                <p className="text-sm font-semibold text-white">Clean Sheets</p>
                <p className="text-xs text-slate-500">Games without conceding</p>
              </div>
            </div>
            <LeaderboardTable rows={leaderboard.topCleanSheets as StatRow[]} col="cleanSheets" label="CS" />
          </div>

          {/* Man of the Match */}
          <div className="overflow-hidden rounded-2xl border border-rsa-border" style={{ background: 'rgba(14,10,3,0.88)' }}>
            <div className="border-b border-rsa-border bg-black/25 px-5 py-4 flex items-center gap-2">
              <span style={{ fontSize: '1.1rem' }}>🏆</span>
              <div>
                <p className="text-sm font-semibold text-white">Man of the Match</p>
                <p className="text-xs text-slate-500">MOTM awards this season</p>
              </div>
            </div>
            <LeaderboardTable rows={leaderboard.topMotm as StatRow[]} col="motm" label="MOTM" />
          </div>
        </div>
      </section>

      {/* Transfer & League activity */}
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-rsa-border bg-white/3 p-6">
          <h2 className="text-base font-semibold text-white">Transfer Activity</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Completed', value: stats.completedTransfersCount, color: '#34d399' },
              { label: 'Pending',   value: stats.pendingTransfersCount,   color: '#f59e0b' },
              { label: 'Declined',  value: stats.declinedTransfersCount,  color: '#ef4444' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-rsa-border bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: item.color }}>{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-rsa-border bg-white/3 p-6">
          <h2 className="text-base font-semibold text-white">League Tracking</h2>
          <div className="mt-5 space-y-3">
            {[
              { label: 'Seasons',             value: stats.seasonsCount },
              { label: 'League Entries',      value: stats.leagueTableEntriesCount },
              { label: 'Fixtures Scheduled',  value: stats.fixturesCount },
              { label: 'Results Recorded',    value: stats.resultsCount },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-rsa-border bg-black/20 px-4 py-3">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className="text-sm font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
