import { useEffect, useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import StatCard from '../components/widgets/StatCard';

export default function CompliancePage() {
  const [compliance, setCompliance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/compliance').then(r => r.json()).then(setCompliance).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400">Loading…</div>;

  const activeWarnings = (compliance?.warnings ?? []).filter((w: any) => w.status === 'ACTIVE');
  const latestViolations = (compliance?.violations ?? []).slice(0, 8);

  return (
    <main className="main-shell">
      <div className="mx-auto w-full max-w-7xl">
        <BrandHeader />
        <div className="mt-6">
          <h1 className="text-3xl font-semibold text-white">Compliance</h1>
          <p className="mt-3 text-slate-400">Real-time compliance health, warnings, and violation summaries.</p>
        </div>
        <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Violations" value={compliance?.totalViolations ?? 0} />
          <StatCard title="Active Warnings" value={activeWarnings.length} />
          <StatCard title="Critical Issues" value={compliance?.critical ?? 0} />
          <StatCard title="Last Scan" value={compliance?.lastScan ? new Date(compliance.lastScan).toLocaleString() : 'Never'} />
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl p-6" style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(15,23,42,0.7)' }}>
            <h2 className="text-xl font-semibold text-white">Violation Breakdown</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              {Object.entries(compliance?.violationsByType ?? {}).length === 0 ? (
                <p className="text-slate-400">No tracked violations currently available.</p>
              ) : (Object.entries(compliance?.violationsByType ?? {}) as Array<[string, any]>).map(([type, count]) => (
                <div key={type} className="flex justify-between gap-4 rounded-2xl px-4 py-3" style={{ border: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)' }}>
                  <span>{type}</span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl p-6" style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(15,23,42,0.7)' }}>
            <h2 className="text-xl font-semibold text-white">Open Warnings</h2>
            {activeWarnings.length === 0 ? (
              <p className="mt-4 text-slate-400">No active warnings.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {activeWarnings.map((w: any) => (
                  <div key={w.id} className="rounded-2xl px-4 py-3" style={{ border: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)' }}>
                    <div className="text-sm text-white">{w.message || w.type}</div>
                    <div className="text-xs text-slate-500">{w.createdAt ? new Date(w.createdAt).toLocaleDateString() : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
