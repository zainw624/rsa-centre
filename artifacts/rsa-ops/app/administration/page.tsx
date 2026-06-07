import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdministrationSummary } from '@/lib/db';
import AdminControls from '@/components/AdminControls';

export const dynamic = 'force-dynamic';
const ADMIN_ROLES = ['RSA | Founders', 'RSA | Co Founders', 'RSA | Executive'];

function isAdmin(session: any) {
  const roles = session?.user?.roles || [];
  return session?.user?.permission === 'owner'
    || ADMIN_ROLES.some((role) => roles.includes(role))
    || process.env.BOT_OWNER_ID === session?.user?.discordId;
}

export default async function AdministrationPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  if (!isAdmin(session)) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-rose-500/40 bg-slate-950/80 p-8 text-slate-300">
        <h1 className="text-2xl font-semibold text-white">Access denied</h1>
        <p className="mt-4 text-sm text-slate-400">You do not have permission to view the Administration page.</p>
      </div>
    );
  }

  const summary = await getAdministrationSummary();
  const settings = summary.settings;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="mb-4">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Administration</p>
        <h1 className="text-2xl font-semibold text-white">Platform administration</h1>
        <p className="mt-2 text-sm text-slate-400">Monitor platform health, audit records and system sync status from a central operations panel.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-rsa-border bg-slate-950/80 p-6">
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Platform health</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div>Platform status: <span className="font-semibold text-emerald-400">Healthy</span></div>
            <div>Database: <span className="font-semibold text-emerald-400">Connected</span></div>
            <div>Discord sync: <span className="font-semibold text-emerald-400">Online</span></div>
            <div>Role sync: <span className="font-semibold text-emerald-400">Configured</span></div>
            <div>Bot sync: <span className="font-semibold text-emerald-400">Connected</span></div>
          </div>
        </div>

        <div className="rounded-3xl border border-rsa-border bg-slate-950/80 p-6">
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Compliance</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div>Active sanctions: <span className="font-semibold text-white">{summary.activeSanctions}</span></div>
            <div>Cup tied players: <span className="font-semibold text-white">{summary.cupTied}</span></div>
            <div>Pending transfers: <span className="font-semibold text-white">{summary.pendingTransfers}</span></div>
            <div>Registered users: <span className="font-semibold text-white">{summary.userCount}</span></div>
          </div>
        </div>

        <div className="rounded-3xl border border-rsa-border bg-slate-950/80 p-6">
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Platform settings</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div>Transfer window: <span className="font-semibold text-white">{settings?.transferWindowOpen ? 'Open' : 'Closed'}</span></div>
            <div>World Cup mode: <span className="font-semibold text-white">{settings?.worldCupMode ? 'Active' : 'Inactive'}</span></div>
            <div>Free agent role: <span className="font-semibold text-white">{settings?.freeAgentRoleName || 'Not configured'}</span></div>
            <div>Compliance roles configured: <span className="font-semibold text-white">{Array.isArray(settings?.sanctionRoleNames) ? settings?.sanctionRoleNames.length : 0}</span></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-rsa-border bg-slate-950/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-rsa-gold">Audit logs</p>
                <h2 className="text-xl font-semibold text-white">Recent audit entries</h2>
              </div>
              <div className="text-sm text-slate-400">{summary.recentAudit.length} entries</div>
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              {summary.recentAudit.length === 0 ? (
                <p className="text-slate-500">No audit records available.</p>
              ) : (
                summary.recentAudit.map((entry: any) => (
                  <div key={entry.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                    <div className="font-medium text-white">{entry.actionType}</div>
                    <div className="mt-1 text-slate-400">{entry.sourceCommand || 'system'}</div>
                    <div className="mt-2 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-rsa-border bg-slate-950/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-rsa-gold">System logs</p>
                <h2 className="text-xl font-semibold text-white">Recent platform events</h2>
              </div>
              <div className="text-sm text-slate-400">{summary.recentSystem.length} entries</div>
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              {summary.recentSystem.length === 0 ? (
                <p className="text-slate-500">No system activity logged.</p>
              ) : (
                summary.recentSystem.map((entry: any) => (
                  <div key={entry.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                    <div className="font-medium text-white">{entry.text || entry.type || 'System event'}</div>
                    <div className="mt-2 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <AdminControls />

          <section className="rounded-3xl border border-rsa-border bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Quick summary</p>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div>Teams configured: <span className="font-semibold text-white">{summary.teamCount}</span></div>
              <div>Transfers total: <span className="font-semibold text-white">{summary.transferCount}</span></div>
              <div>Active sanctions: <span className="font-semibold text-white">{summary.activeSanctions}</span></div>
              <div>Audit log depth: <span className="font-semibold text-white">{summary.recentAudit.length}</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
