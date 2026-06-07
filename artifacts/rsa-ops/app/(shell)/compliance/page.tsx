import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StatCard from '@/components/widgets/StatCard';
import { getComplianceSummary } from '@/lib/db';

export const dynamic = 'force-dynamic';

const EMPTY: any = {
  totalViolations: 0, critical: 0, lastScan: null,
  warnings: [], violations: [], violationsByType: {},
};

export default async function CompliancePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  let compliance = EMPTY;
  let dbError = false;

  try {
    compliance = await getComplianceSummary();
  } catch {
    dbError = true;
  }

  const activeWarnings  = compliance.warnings.filter((w: any) => w.status === 'ACTIVE');
  const latestViolations = compliance.violations.slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Compliance</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Compliance Centre</h1>
        <p className="mt-1 text-sm text-slate-500">Real-time compliance health, warnings, and violation summaries</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view compliance data</p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Violations" value={compliance.totalViolations} />
            <StatCard title="Active Warnings"  value={activeWarnings.length} />
            <StatCard title="Critical Issues"  value={compliance.critical} />
            <StatCard title="Last Scan"        value={compliance.lastScan ? new Date(compliance.lastScan).toLocaleString() : 'Never'} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-rsa-border bg-white/3 p-6">
              <h2 className="text-base font-semibold text-white">Violation Breakdown</h2>
              <div className="mt-5 space-y-3">
                {Object.entries(compliance.violationsByType).length === 0 ? (
                  <p className="text-sm text-slate-500">No tracked violations currently available.</p>
                ) : (
                  (Object.entries(compliance.violationsByType) as Array<[string, number]>).map(([type, count]) => (
                    <div key={type} className="flex justify-between gap-4 rounded-xl border border-rsa-border bg-black/20 px-4 py-3 text-sm">
                      <span className="text-slate-300">{type}</span>
                      <span className="font-semibold text-white">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-rsa-border bg-white/3 p-6">
              <h2 className="text-base font-semibold text-white">Open Warnings</h2>
              {activeWarnings.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-black/20 p-6 text-sm text-slate-500">No active warnings.</div>
              ) : (
                <div className="mt-5 space-y-3">
                  {activeWarnings.slice(0, 5).map((warning: any) => (
                    <div key={warning.id} className="rounded-xl border border-rsa-border bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-semibold text-white">{warning.type}</span>
                        <span className="text-slate-400">{warning.severity}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{warning.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-rsa-border">
            <div className="border-b border-rsa-border bg-white/3 px-5 py-4">
              <h2 className="text-base font-semibold text-white">Recent Violations</h2>
            </div>
            {latestViolations.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No compliance violations have been recorded.</div>
            ) : (
              <div className="divide-y divide-rsa-border">
                {latestViolations.map((v: any) => (
                  <div key={v.timestamp + v.type} className="flex items-start justify-between gap-4 px-5 py-4 text-sm">
                    <div>
                      <span className="font-semibold text-white">{v.type}</span>
                      <p className="mt-1 text-slate-400">{v.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">{v.severity}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
