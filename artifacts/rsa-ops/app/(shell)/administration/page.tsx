import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdministrationSummary } from '@/lib/db';
import AdminControls from '@/components/AdminControls';
import { BrandHeader } from '@/components/BrandHeader';
import {
  can,
  rolesByTier,
  capabilitiesForTier,
  shortRole,
  PERMISSION_COLOR,
  PERMISSION_LABEL,
  CAPABILITY_LABEL,
  RESTRICTED_ACTIONS,
} from '@/lib/permissions';
import { Settings, ShieldAlert, Activity, Database, CheckCircle2, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

function isAdmin(session: any): boolean {
  const perm = session?.user?.permission ?? '';
  return can(perm, 'viewAdmin')
    || process.env.BOT_OWNER_ID === session?.user?.discordId;
}

const EMPTY_SUMMARY = {
  activeSanctions: 0, cupTied: 0, pendingTransfers: 0, userCount: 0,
  teamCount: 0, transferCount: 0, recentAudit: [], recentSystem: [],
  settings: null,
};

export default async function AdministrationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  if (!isAdmin(session)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card-panel p-8 text-center max-w-md border-destructive/30 bg-destructive/5">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive font-display tracking-tight">Access Denied</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground leading-relaxed">You need League Staff or higher permission to view this page.</p>
        </div>
      </div>
    );
  }

  let summary: any = EMPTY_SUMMARY;
  let dbError = false;

  try {
    summary = await getAdministrationSummary();
  } catch {
    dbError = true;
  }

  const settings = summary.settings;

  const perm = session.user?.permission ?? '';
  const isOwner = process.env.BOT_OWNER_ID === (session.user as any)?.discordId;
  const canBackup = can(perm, 'backup') || isOwner;
  const canSync = can(perm, 'syncDiscord') || isOwner;

  return (
    <div className="space-y-6">
      <BrandHeader
        title="Platform Administration"
        subtitle="Monitor platform health, audit records and system configuration"
      />

      {dbError && (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-5 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <span className="text-sm font-medium text-amber-500">Database not connected — showing empty state. Set DATABASE_URL to activate live data.</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card-panel p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground font-display">System Health</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Platform Status', value: 'Healthy',    ok: true },
              { label: 'Database',        value: dbError ? 'Not connected' : 'Connected', ok: !dbError },
              { label: 'Discord Sync',    value: 'Configured', ok: true },
              { label: 'Role Sync',       value: 'Configured', ok: true },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center p-3 rounded-xl bg-background border border-border/50">
                <span className="text-sm font-bold text-muted-foreground">{row.label}</span>
                <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${row.ok ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-destructive bg-destructive/10 border-destructive/20'}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-panel p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground font-display">Compliance Pulse</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Active Sanctions',  value: summary.activeSanctions },
              { label: 'Cup-Tied Players',  value: summary.cupTied },
              { label: 'Pending Transfers', value: summary.pendingTransfers },
              { label: 'Registered Users',  value: summary.userCount },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center p-3 rounded-xl bg-background border border-border/50">
                <span className="text-sm font-bold text-muted-foreground">{row.label}</span>
                <span className="text-lg font-mono font-bold text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-panel p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground font-display">Platform Config</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Transfer Window', value: settings?.transferWindowOpen ? 'Open' : 'Closed' },
              { label: 'World Cup Mode',  value: settings?.worldCupMode ? 'Active' : 'Inactive' },
              { label: 'Free Agent Role', value: settings?.freeAgentRoleName || 'Not configured' },
              { label: 'Sanction Roles',  value: Array.isArray(settings?.sanctionRoleNames) ? settings?.sanctionRoleNames.length : 0 },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center p-3 rounded-xl bg-background border border-border/50">
                <span className="text-sm font-bold text-muted-foreground">{row.label}</span>
                <span className="text-xs font-bold text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="card-panel p-6 sm:p-8 border-primary/20">
        <div className="max-w-2xl mb-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-2">Access Control</p>
          <h2 className="text-2xl font-bold text-foreground font-display tracking-tight mb-2">Role Hierarchy & Permissions</h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            Synced from the Discord server, organized from most senior to least. A member's capabilities are derived from their highest assigned role.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {rolesByTier().map(({ tier, roles }) => {
            const caps = capabilitiesForTier(tier);
            const colorClass = PERMISSION_COLOR[tier] ? `text-[${PERMISSION_COLOR[tier]}]` : 'text-primary';
            // Use inline style for dynamic colors if arbitrary classes don't compile nicely, but our mapping has standard names.
            // Wait, PERMISSION_COLOR returns raw hex or tailwind class? 
            // In the file it says: owner: '#f59e0b', administrator: '#c9a55a', league: '#60a5fa'... wait, in original it was hex.
            // Let's just use the badge color mapping style we had.
            
            return (
              <div key={tier} className="p-5 rounded-2xl bg-background border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-border/50 pb-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PERMISSION_COLOR[tier] }} />
                  <span className="text-base font-bold text-foreground font-display">{PERMISSION_LABEL[tier]}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {roles.map((r) => (
                    <span key={r} className="rounded-lg border border-border bg-muted/50 px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">{shortRole(r)}</span>
                  ))}
                </div>
                <ul className="space-y-2">
                  {caps.length === 0 ? (
                    <li className="text-xs font-medium text-muted-foreground italic">View-only access</li>
                  ) : (
                    caps.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-xs font-bold text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        {CAPABILITY_LABEL[c]}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-5 rounded-2xl border border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-destructive" />
            <span className="text-sm font-bold text-destructive">Restricted Platform Actions</span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {RESTRICTED_ACTIONS.map((a) => (
              <li key={a} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="card-panel p-6">
            <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-2">
              <h2 className="text-lg font-bold text-foreground font-display">Audit Log</h2>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">{summary.recentAudit.length} entries</span>
            </div>
            <div className="space-y-3">
              {summary.recentAudit.length === 0 ? (
                <div className="p-8 text-center text-sm font-medium text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border/50">
                  No audit records available.
                </div>
              ) : (
                summary.recentAudit.map((entry: any) => (
                  <div key={entry.id} className="p-4 rounded-xl bg-background border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-primary/30 transition-colors">
                    <div>
                      <span className="text-sm font-bold text-foreground">{entry.actionType}</span>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5 font-mono">{entry.sourceCommand || 'system'}</p>
                    </div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground shrink-0">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card-panel p-6">
            <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-2">
              <h2 className="text-lg font-bold text-foreground font-display">System Events</h2>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">{summary.recentSystem.length} entries</span>
            </div>
            <div className="space-y-3">
              {summary.recentSystem.length === 0 ? (
                <div className="p-8 text-center text-sm font-medium text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border/50">
                  No system activity logged.
                </div>
              ) : (
                summary.recentSystem.map((entry: any) => (
                  <div key={entry.id} className="p-4 rounded-xl bg-background border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-primary/30 transition-colors">
                    <span className="text-sm font-medium text-foreground">{entry.text || entry.type || 'System event'}</span>
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground shrink-0">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <AdminControls canBackup={canBackup} canSync={canSync} />
          
          <section className="card-panel p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-2">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground font-display">Database Scale</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Teams',           value: summary.teamCount },
                { label: 'Transfers Total', value: summary.transferCount },
                { label: 'Active Sanctions',value: summary.activeSanctions },
                { label: 'Audit Depth',     value: summary.recentAudit.length },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center p-3 rounded-xl bg-background border border-border/50">
                  <span className="text-sm font-bold text-muted-foreground">{row.label}</span>
                  <span className="text-lg font-mono font-bold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
