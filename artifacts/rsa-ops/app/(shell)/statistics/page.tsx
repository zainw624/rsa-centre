import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StatCard from '@/components/widgets/StatCard';
import { getStatisticsSummary } from '@/lib/db';

export const dynamic = 'force-dynamic';

const EMPTY_STATS = {
  playersCount: 0, teamsCount: 0, managersCount: 0, assistantManagersCount: 0,
  activeSanctionsCount: 0, cupTiedCount: 0, completedTransfersCount: 0,
  pendingTransfersCount: 0, declinedTransfersCount: 0, seasonsCount: 0,
  leagueTableEntriesCount: 0, fixturesCount: 0, resultsCount: 0,
};

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  let stats = EMPTY_STATS;
  let dbError = false;

  try {
    stats = await getStatisticsSummary();
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Statistics</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">League Statistics</h1>
        <p className="mt-1 text-sm text-slate-500">High-level RSA metrics for players, transfers, fixtures, and compliance</p>
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Active Players"      value={stats.playersCount} />
        <StatCard title="Registered Teams"    value={stats.teamsCount} />
        <StatCard title="Assigned Managers"   value={stats.managersCount} />
        <StatCard title="Assistant Managers"  value={stats.assistantManagersCount} />
        <StatCard title="Active Sanctions"    value={stats.activeSanctionsCount} />
        <StatCard title="Cup-Tied Players"    value={stats.cupTiedCount} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
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
      </div>
    </div>
  );
}
