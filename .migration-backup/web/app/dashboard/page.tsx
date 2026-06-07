import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BrandHeader } from '@/components/BrandHeader';
import { RoleBadge } from '@/components/RoleBadge';
import StatCard from '@/components/widgets/StatCard';
import StatusCard from '@/components/widgets/StatusCard';
import ActivityCard from '@/components/widgets/ActivityCard';
import FixtureCard from '@/components/widgets/FixtureCard';
import ResultCard from '@/components/widgets/ResultCard';
import TransferCard from '@/components/widgets/TransferCard';
import ComplianceCard from '@/components/widgets/ComplianceCard';
import LeagueTablePreview from '@/components/widgets/LeagueTablePreview';
import {
  getTotals,
  getSettings,
  getUpcomingFixtures,
  getLatestResults,
  getTransfers,
  getRecentActivity,
  getLeagueSnapshot,
  getActiveSanctions,
  getCupTiedPlayers,
  getLeagueHealth,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }
  // Load dashboard data from the database in parallel
  const [totals, settings, fixtures, results, transfers, activity, leagueRows, sanctions, cupTied, leagueHealth] = await Promise.all([
    getTotals(),
    getSettings(),
    getUpcomingFixtures(6),
    getLatestResults(6),
    getTransfers(8),
    getRecentActivity(12),
    getLeagueSnapshot(6),
    getActiveSanctions(6),
    getCupTiedPlayers(),
    getLeagueHealth(),
  ]);

  return (
    <main className="main-shell">
      <div className="mx-auto w-full max-w-7xl">
        <BrandHeader />

        <section className="mt-6 grid gap-6 lg:grid-cols-4">
          <div className="col-span-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Players" value={totals.playersCount} />
            <StatCard title="Total Teams" value={totals.teamsCount} />
            <StatCard title="Total Managers" value={totals.managersCount} />
            <StatCard title="Assistant Managers" value={totals.assistantManagersCount} />
            <StatCard title="Total Staff" value={totals.staffCount} />
            <StatusCard title="Transfer Window" status={settings?.transferWindowOpen ? 'Open' : 'Closed'} hint={settings?.transferWindowOpen ? 'Transfers are being accepted' : 'Transfers are currently closed'} />
          </div>

          <aside className="col-span-1 space-y-6">
            <StatusCard title="World Cup Mode" status={settings?.worldCupMode ? 'Active' : 'Inactive'} />
            <StatusCard title="League Health" status={`${leagueHealth.percentCompleted}% Complete`} hint={`Played ${leagueHealth.played} / ${leagueHealth.totalFixtures}`} />
            <ComplianceCard issues={sanctions} />
          </aside>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <FixtureCard fixtures={fixtures} />
          <ResultCard results={results} />
          <TransferCard transfers={transfers} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityCard items={activity.map((a: any) => ({ id: a.id, text: a.text, createdAt: a.createdAt }))} />
          </div>
          <div>
            <LeagueTablePreview rows={leagueRows} />
            <div className="mt-4" />
            <div className="card rounded-2xl border border-rsa-border p-4">
              <p className="text-xs uppercase tracking-widest text-rsa-gold">Active Sanctions</p>
              <div className="mt-3 text-sm text-white">{sanctions.length} active</div>
              <p className="mt-2 text-xs text-slate-400">Cup tied players: {cupTied.length}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
