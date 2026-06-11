import { getActiveSanctions, getCupTiedPlayers } from '@/lib/db';
import { BrandHeader } from '@/components/BrandHeader';
import { ShieldAlert, AlertTriangle, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DisciplinePage() {
  let sanctions: any[] = [];
  let cupTied: any[]   = [];
  let dbError = false;

  try {
    [sanctions, cupTied] = await Promise.all([getActiveSanctions(50), getCupTiedPlayers()]);
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <BrandHeader
        title="Sanctions & Eligibility"
        subtitle="Active bans, restrictions, and cup-tied player status"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view discipline data</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            <div className="card-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  <h2 className="text-lg font-bold text-foreground font-display">Sanctioned Players</h2>
                </div>
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {sanctions.length} Active
                </span>
              </div>
              
              {sanctions.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-background/50 rounded-xl border border-dashed border-border/50">
                  <ShieldAlert className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-bold text-foreground">No active sanctions</p>
                  <p className="text-xs text-muted-foreground mt-1">League discipline is clean.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted border-b border-border text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Player</th>
                        <th className="px-4 py-3">Sanction</th>
                        <th className="px-4 py-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-background">
                      {sanctions.map((s: any) => (
                        <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-bold text-foreground">{s.playerTag}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider bg-destructive/10 border border-destructive/20 text-destructive">
                              {s.sanctionType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-medium text-xs max-w-[200px] truncate" title={s.reason}>
                            {s.reason || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card-panel p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground font-display">Sanction History</h2>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed p-4 bg-muted/30 rounded-xl border border-border/50">
                Historical sanctions are managed through the Discord bot. Complete historical records are stored securely and synchronized when active bans affect league eligibility.
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="card-panel p-6 border-primary/30 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5">
                <Lock className="w-32 h-32" />
              </div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-2 relative z-10">Cup-Tied Players</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <p className="text-5xl font-bold text-foreground font-display tracking-tight">{cupTied.length}</p>
                <p className="text-sm font-bold text-muted-foreground">restricted</p>
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground relative z-10">
                These players cannot be signed during active cup competitions.
              </p>
            </div>

            <div className="card-panel p-6">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-4">Eligibility Rules</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-sm font-medium text-foreground">Cup-tied players cannot be signed to new teams.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                  <p className="text-sm font-medium text-foreground">Sanctioned players may be restricted from match participation.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  <p className="text-sm font-medium text-muted-foreground">All decisions are enforced by the RSA bot and recorded here for staff reference.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
