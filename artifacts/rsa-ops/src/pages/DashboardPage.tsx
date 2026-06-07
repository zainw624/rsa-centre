import { useEffect, useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import StatCard from '../components/widgets/StatCard';
import StatusCard from '../components/widgets/StatusCard';
import ActivityCard from '../components/widgets/ActivityCard';
import FixtureCard from '../components/widgets/FixtureCard';
import ResultCard from '../components/widgets/ResultCard';
import TransferCard from '../components/widgets/TransferCard';
import ComplianceCard from '../components/widgets/ComplianceCard';
import LeagueTablePreview from '../components/widgets/LeagueTablePreview';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) setData(await res.json());
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <BrandHeader />
        <div className="mt-6 text-slate-400">Loading dashboard…</div>
      </div>
    );
  }

  const totals = data?.totals ?? {};
  const settings = data?.settings ?? {};
  const fixtures = data?.fixtures ?? [];
  const results = data?.results ?? [];
  const transfers = data?.transfers ?? [];
  const activity = data?.activity ?? [];
  const leagueRows = data?.leagueRows ?? [];
  const sanctions = data?.sanctions ?? [];
  const cupTied = data?.cupTied ?? [];
  const leagueHealth = data?.leagueHealth ?? { percentCompleted: 0, played: 0, totalFixtures: 0 };

  return (
    <main className="main-shell">
      <div className="mx-auto w-full max-w-7xl">
        <BrandHeader />

        <section className="mt-6 grid gap-6 lg:grid-cols-4">
          <div className="col-span-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Players" value={totals.playersCount ?? 0} />
            <StatCard title="Total Teams" value={totals.teamsCount ?? 0} />
            <StatCard title="Total Managers" value={totals.managersCount ?? 0} />
            <StatCard title="Assistant Managers" value={totals.assistantManagersCount ?? 0} />
            <StatCard title="Total Staff" value={totals.staffCount ?? 0} />
            <StatusCard title="Transfer Window" status={settings.transferWindowOpen ? 'Open' : 'Closed'} hint={settings.transferWindowOpen ? 'Transfers are being accepted' : 'Transfers are currently closed'} />
          </div>

          <aside className="col-span-1 space-y-6">
            <StatusCard title="World Cup Mode" status={settings.worldCupMode ? 'Active' : 'Inactive'} />
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
            <div className="card rounded-2xl p-4">
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
