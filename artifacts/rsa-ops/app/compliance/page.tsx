import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BrandHeader } from '@/components/BrandHeader';
import StatCard from '@/components/widgets/StatCard';
import { getComplianceSummary } from '@/lib/db';

export const dynamic = 'force-dynamic';
export default async function CompliancePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const compliance = await getComplianceSummary();
  const activeWarnings = compliance.warnings.filter((warning: any) => warning.status === 'ACTIVE');
  const latestViolations = compliance.violations.slice(0, 8);

  return (
    <main className="main-shell">
      <div className="mx-auto w-full max-w-7xl">
        <BrandHeader />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-semibold text-white">Compliance</h1>
            <p className="mt-3 text-slate-400">Real-time compliance health, warnings, and violation summaries for RSA operations.</p>
          </div>

          <aside className="rounded-2xl border border-rsa-border bg-slate-950/70 p-6">
            <p className="text-xs uppercase tracking-widest text-rsa-gold">Health Score</p>
            <p className="mt-3 text-sm text-slate-300">This page tracks current violations from the bot-managed compliance engine.</p>
          </aside>
        </div>

        <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Violations" value={compliance.totalViolations} />
          <StatCard title="Active Warnings" value={activeWarnings.length} />
          <StatCard title="Critical Issues" value={compliance.critical} />
          <StatCard title="Last Scan" value={compliance.lastScan ? new Date(compliance.lastScan).toLocaleString() : 'Never'} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-rsa-border bg-slate-950/70 p-6">
            <h2 className="text-xl font-semibold text-white">Violation Breakdown</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              {(Object.entries(compliance.violationsByType) as Array<[string, number]>).map(([type, count]) => (
                <div key={type} className="flex justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                  <span>{type}</span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
              ))}
              {Object.keys(compliance.violationsByType).length === 0 && <p className="text-slate-400">No tracked violations currently available.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-rsa-border bg-slate-950/70 p-6">
            <h2 className="text-xl font-semibold text-white">Open Warnings</h2>
            {activeWarnings.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-slate-400">No active warnings currently.</div>
            ) : (
              <div className="mt-6 space-y-3">
                {activeWarnings.slice(0, 5).map((warning: any) => (
                  <div key={warning.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
                      <span className="font-semibold text-white">{warning.type}</span>
                      <span>{warning.severity}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{warning.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-6">
          <div className="overflow-hidden rounded-3xl border border-rsa-border bg-slate-950/70">
            <div className="border-b border-slate-800 bg-slate-900/90 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Recent Violations</h2>
            </div>
            <div className="divide-y divide-slate-800">
              {latestViolations.length === 0 ? (
                <div className="p-6 text-slate-400">No compliance violations have been recorded.</div>
              ) : (
                latestViolations.map((violation: any) => (
                  <div key={violation.timestamp + violation.type} className="p-6 text-sm text-slate-300">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className="font-semibold text-white">{violation.type}</span>
                      <span className="text-slate-400">{violation.severity}</span>
                    </div>
                    <p className="mt-2 text-slate-400">{violation.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
