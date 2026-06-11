import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StatCard from '@/components/widgets/StatCard';
import { BrandHeader } from '@/components/BrandHeader';
import { getComplianceSummary } from '@/lib/db';
import { ShieldAlert, AlertTriangle, CheckCircle, FileCheck2 } from 'lucide-react';

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
  const isHealthy = compliance.totalViolations === 0 && activeWarnings.length === 0;

  return (
    <div className="space-y-6">
      <BrandHeader
        title="Compliance Centre"
        subtitle="Real-time compliance health, warnings, and violation summaries"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view compliance data</p>
        </div>
      ) : (
        <>
          {isHealthy && (
            <div className="card-panel border-emerald-500/30 bg-emerald-500/5 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-500 font-display">System Compliant</h2>
                <p className="text-sm font-medium text-emerald-500/80">No active warnings or violations detected in the latest scan.</p>
              </div>
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Violations" value={compliance.totalViolations} icon={<FileCheck2 className="w-5 h-5"/>} />
            <StatCard title="Active Warnings"  value={activeWarnings.length} icon={<AlertTriangle className="w-5 h-5"/>} />
            <StatCard title="Critical Issues"  value={compliance.critical} icon={<ShieldAlert className="w-5 h-5"/>} />
            <div className="card-panel p-5 flex flex-col justify-between bg-muted/20 border-dashed">
               <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Last Scan</p>
               <div className="mt-4 text-lg font-bold text-foreground font-display leading-tight">
                  {compliance.lastScan ? new Date(compliance.lastScan).toLocaleString() : 'Never'}
               </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="card-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileCheck2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground font-display">Violation Breakdown</h2>
              </div>
              
              <div className="space-y-3">
                {Object.entries(compliance.violationsByType).length === 0 ? (
                  <div className="p-8 text-center bg-background/50 rounded-xl border border-dashed border-border/50">
                    <p className="text-sm font-bold text-muted-foreground">No tracked violations</p>
                  </div>
                ) : (
                  (Object.entries(compliance.violationsByType) as Array<[string, number]>).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center p-4 rounded-xl bg-background border border-border shadow-sm">
                      <span className="font-bold text-sm text-foreground">{type}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-muted text-muted-foreground">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card-panel p-6 border-amber-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-foreground font-display">Open Warnings</h2>
                </div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full">
                  {activeWarnings.length} Active
                </span>
              </div>
              
              {activeWarnings.length === 0 ? (
                <div className="p-8 text-center bg-background/50 rounded-xl border border-dashed border-border/50">
                  <p className="text-sm font-bold text-muted-foreground">No active warnings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeWarnings.slice(0, 5).map((warning: any) => (
                    <div key={warning.id} className="p-4 rounded-xl bg-background border border-amber-500/30 shadow-sm border-l-4 border-l-amber-500">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="font-bold text-sm text-foreground">{warning.type}</span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">{warning.severity}</span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed">{warning.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="card-panel mt-6">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="text-lg font-bold text-foreground font-display">Recent Violations</h2>
            </div>
            {latestViolations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-bold text-muted-foreground">No compliance violations recorded</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {latestViolations.map((v: any) => (
                  <div key={v.timestamp + v.type} className="p-5 hover:bg-muted/30 transition-colors flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">{v.type}</h3>
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed max-w-3xl">{v.message}</p>
                    </div>
                    <span className={`shrink-0 text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded border ${v.severity === 'CRITICAL' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {v.severity}
                    </span>
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
