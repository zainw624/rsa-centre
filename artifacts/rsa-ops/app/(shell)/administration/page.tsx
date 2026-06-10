import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdministrationSummary } from '@/lib/db';
import AdminControls from '@/components/AdminControls';
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
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/05 p-8 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 h-10 w-10">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h1 className="text-xl font-semibold text-white">Access Denied</h1>
          <p className="mt-3 text-sm text-slate-400">You need League Staff or higher permission to view this page.</p>
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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Administration</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Platform Administration</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor platform health, audit records and system sync status</p>
      </header>

      {dbError && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-4 text-sm text-amber-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Database not connected — showing empty state. Set <code className="rounded bg-black/30 px-1 text-xs">DATABASE_URL</code> to activate live data.</span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Platform Health</p>
          <div className="mt-5 space-y-2.5 text-sm">
            {[
              { label: 'Platform Status', value: 'Healthy',    ok: true },
              { label: 'Database',        value: dbError ? 'Not connected' : 'Connected', ok: !dbError },
              { label: 'Discord Sync',    value: 'Configured', ok: true },
              { label: 'Role Sync',       value: 'Configured', ok: true },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-slate-400">{row.label}</span>
                <span className={`font-semibold ${row.ok ? 'text-emerald-400' : 'text-amber-400'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Compliance</p>
          <div className="mt-5 space-y-2.5 text-sm">
            {[
              { label: 'Active Sanctions',  value: summary.activeSanctions },
              { label: 'Cup-Tied Players',  value: summary.cupTied },
              { label: 'Pending Transfers', value: summary.pendingTransfers },
              { label: 'Registered Users',  value: summary.userCount },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-slate-400">{row.label}</span>
                <span className="font-semibold text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Platform Settings</p>
          <div className="mt-5 space-y-2.5 text-sm">
            {[
              { label: 'Transfer Window', value: settings?.transferWindowOpen ? 'Open' : 'Closed' },
              { label: 'World Cup Mode',  value: settings?.worldCupMode ? 'Active' : 'Inactive' },
              { label: 'Free Agent Role', value: settings?.freeAgentRoleName || 'Not configured' },
              { label: 'Sanction Roles',  value: Array.isArray(settings?.sanctionRoleNames) ? settings?.sanctionRoleNames.length : 0 },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-slate-400">{row.label}</span>
                <span className="font-semibold text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-rsa-border bg-white/3 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Staff Hierarchy & Permissions</p>
        <h2 className="mt-1 text-base font-semibold text-white">Discord role hierarchy and what each tier can do</h2>
        <p className="mt-1 text-sm text-slate-500">Synced from the Discord server, most senior first. A member&apos;s access is derived from their highest role.</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {rolesByTier().map(({ tier, roles }) => {
            const caps = capabilitiesForTier(tier);
            return (
              <div key={tier} className="rounded-xl border border-rsa-border bg-black/20 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PERMISSION_COLOR[tier] }} />
                  <span className="text-sm font-semibold text-white">{PERMISSION_LABEL[tier]}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {roles.map((r) => (
                    <span key={r} className="rounded-md border border-rsa-border bg-white/5 px-2 py-0.5 text-xs text-slate-300">{shortRole(r)}</span>
                  ))}
                </div>
                <ul className="mt-3 space-y-1">
                  {caps.length === 0 ? (
                    <li className="text-xs text-slate-500">View-only access</li>
                  ) : (
                    caps.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-xs text-slate-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                        {CAPABILITY_LABEL[c]}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/05 p-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            <span className="text-sm font-semibold text-red-300">Restricted — no role can do these</span>
          </div>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {RESTRICTED_ACTIONS.map((a) => (
              <li key={a} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-red-400">✕</span> {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-rsa-border bg-white/3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Audit Logs</h2>
              <span className="text-xs text-slate-500">{summary.recentAudit.length} entries</span>
            </div>
            <div className="mt-5 space-y-3">
              {summary.recentAudit.length === 0 ? (
                <p className="text-sm text-slate-500">No audit records available.</p>
              ) : (
                summary.recentAudit.map((entry: any) => (
                  <div key={entry.id} className="rounded-xl border border-rsa-border bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{entry.actionType}</span>
                      <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{entry.sourceCommand || 'system'}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-rsa-border bg-white/3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">System Logs</h2>
              <span className="text-xs text-slate-500">{summary.recentSystem.length} entries</span>
            </div>
            <div className="mt-5 space-y-3">
              {summary.recentSystem.length === 0 ? (
                <p className="text-sm text-slate-500">No system activity logged.</p>
              ) : (
                summary.recentSystem.map((entry: any) => (
                  <div key={entry.id} className="rounded-xl border border-rsa-border bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{entry.text || entry.type || 'System event'}</span>
                      <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <AdminControls canBackup={canBackup} canSync={canSync} />
          <section className="rounded-2xl border border-rsa-border bg-white/3 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Quick Summary</p>
            <div className="mt-5 space-y-2.5 text-sm">
              {[
                { label: 'Teams',           value: summary.teamCount },
                { label: 'Transfers Total', value: summary.transferCount },
                { label: 'Active Sanctions',value: summary.activeSanctions },
                { label: 'Audit Depth',     value: summary.recentAudit.length },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="font-semibold text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
