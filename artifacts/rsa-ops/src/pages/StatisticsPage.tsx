import { useEffect, useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import StatCard from '../components/widgets/StatCard';

export default function StatisticsPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/statistics').then(r => r.json()).then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <main className="main-shell">
      <div className="mx-auto w-full max-w-7xl">
        <BrandHeader />
        <div className="mt-6">
          <h1 className="text-3xl font-semibold text-white">Statistics</h1>
          <p className="mt-3 text-slate-400">High-level RSA metrics for player counts, transfers, fixtures, and compliance.</p>
        </div>
        {loading ? <div className="mt-6 text-slate-400">Loading…</div> : (
          <>
            <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard title="Active Players" value={stats.playersCount ?? 0} />
              <StatCard title="Registered Teams" value={stats.teamsCount ?? 0} />
              <StatCard title="Assigned Managers" value={stats.managersCount ?? 0} />
              <StatCard title="Assistant Managers" value={stats.assistantManagersCount ?? 0} />
              <StatCard title="Active Sanctions" value={stats.activeSanctionsCount ?? 0} />
              <StatCard title="Cup-Tied Players" value={stats.cupTiedCount ?? 0} />
            </section>
            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl p-6" style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(15,23,42,0.7)' }}>
                <h2 className="text-xl font-semibold text-white">Transfer Activity</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl p-4" style={{ border: '1px solid rgba(201,165,90,0.12)', background: '#020617' }}>
                    <p className="text-xs uppercase tracking-widest text-rsa-gold">Completed</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{stats.completedTransfersCount ?? 0}</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ border: '1px solid rgba(201,165,90,0.12)', background: '#020617' }}>
                    <p className="text-xs uppercase tracking-widest text-rsa-gold">Pending</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{stats.pendingTransfersCount ?? 0}</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ border: '1px solid rgba(201,165,90,0.12)', background: '#020617' }}>
                    <p className="text-xs uppercase tracking-widest text-rsa-gold">Declined</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{stats.declinedTransfersCount ?? 0}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
