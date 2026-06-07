import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BrandHeader } from '@/components/BrandHeader';
import StatCard from '@/components/widgets/StatCard';
import { getStatisticsSummary } from '@/lib/db';

export const dynamic = 'force-dynamic';
export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const stats = await getStatisticsSummary();

  return (
    <main className="main-shell">
      <div className="mx-auto w-full max-w-7xl">
        <BrandHeader />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-semibold text-white">Statistics</h1>
            <p className="mt-3 text-slate-400">High-level RSA metrics for player counts, transfers, fixtures, and compliance.</p>
          </div>

          <aside className="rounded-2xl border border-rsa-border bg-slate-950/70 p-6">
            <p className="text-xs uppercase tracking-widest text-rsa-gold">Quick Metrics</p>
            <p className="mt-3 text-sm text-slate-300">This page surfaces real-time aggregates from league data and transfer history.</p>
          </aside>
        </div>

        <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Active Players" value={stats.playersCount} />
          <StatCard title="Registered Teams" value={stats.teamsCount} />
          <StatCard title="Assigned Managers" value={stats.managersCount} />
          <StatCard title="Assistant Managers" value={stats.assistantManagersCount} />
          <StatCard title="Active Sanctions" value={stats.activeSanctionsCount} />
          <StatCard title="Cup-Tied Players" value={stats.cupTiedCount} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-rsa-border bg-slate-950/70 p-6">
            <h2 className="text-xl font-semibold text-white">Transfer Activity</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-rsa-border bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-widest text-rsa-gold">Completed</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.completedTransfersCount}</p>
              </div>
              <div className="rounded-2xl border border-rsa-border bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-widest text-rsa-gold">Pending</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.pendingTransfersCount}</p>
              </div>
              <div className="rounded-2xl border border-rsa-border bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-widest text-rsa-gold">Declined</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.declinedTransfersCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-rsa-border bg-slate-950/70 p-6">
            <h2 className="text-xl font-semibold text-white">League Tracking</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div>
                <p className="text-xs uppercase tracking-widest text-rsa-gold">Seasons</p>
                <p className="mt-2 text-white">{stats.seasonsCount}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-rsa-gold">League Entries</p>
                <p className="mt-2 text-white">{stats.leagueTableEntriesCount}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-rsa-gold">Fixtures Scheduled</p>
                <p className="mt-2 text-white">{stats.fixturesCount}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-rsa-gold">Results Recorded</p>
                <p className="mt-2 text-white">{stats.resultsCount}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
