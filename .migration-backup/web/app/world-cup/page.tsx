import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BrandHeader } from '@/components/BrandHeader';
import StatCard from '@/components/widgets/StatCard';
import StatusCard from '@/components/widgets/StatusCard';
import { getWorldCupOverview } from '@/lib/db';

export const dynamic = 'force-dynamic';
export default async function WorldCupPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { settings, cupTiedPlayers, activeSanctions, totalTeams } = await getWorldCupOverview();
  const worldCupActive = settings?.worldCupMode ?? false;
  const hasCupTiedRole = Boolean(settings?.cupTiedRoleId);

  return (
    <main className="main-shell">
      <div className="mx-auto w-full max-w-7xl">
        <BrandHeader />

        <div className="mt-6 grid gap-6 lg:grid-cols-4">
          <div className="col-span-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="World Cup Mode" value={worldCupActive ? 'Active' : 'Inactive'} />
            <StatCard title="Teams Monitored" value={totalTeams} />
            <StatCard title="Active Sanctions" value={activeSanctions.length} />
            <StatusCard title="Cup-Tied Role" status={hasCupTiedRole ? 'Configured' : 'Missing'} hint={hasCupTiedRole ? 'Cup tied enforcement can run' : 'Set cup tied role in settings'} />
          </div>

          <aside className="col-span-1 space-y-6">
            <StatusCard title="Roster Lock" status={worldCupActive ? 'Locked' : 'Unlocked'} hint={worldCupActive ? 'World Cup roster changes are restricted.' : 'Normal roster management is allowed.'} />
            <div className="card rounded-2xl border border-rsa-border p-4">
              <p className="text-xs uppercase tracking-widest text-rsa-gold">World Cup Overview</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {worldCupActive
                  ? 'World Cup roster lock is currently enabled. Only leadership may make roster changes while the World Cup snapshot is active.'
                  : 'World Cup roster lock is inactive. Regular squad and transfer rules are currently in effect.'}
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card rounded-2xl border border-rsa-border p-6">
              <h1 className="text-2xl font-semibold text-white">World Cup Status</h1>
              <p className="mt-3 text-sm text-slate-300">
                {worldCupActive
                  ? 'World Cup mode is enabled and the system is enforcing cup tied restrictions.'
                  : 'The World Cup roster lock is not active.'}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-rsa-border bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-widest text-rsa-gold">Cup-Tied Players</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{cupTiedPlayers.length}</p>
                </div>
                <div className="rounded-2xl border border-rsa-border bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-widest text-rsa-gold">Active World Cup Sanctions</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{activeSanctions.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card rounded-2xl border border-rsa-border p-6">
              <p className="text-xs uppercase tracking-widest text-rsa-gold">Snapshot Status</p>
              <p className="mt-3 text-sm text-slate-300">{worldCupActive ? 'A world cup snapshot is currently active and roster protection is enforced.' : 'No active world cup snapshot detected.'}</p>
            </div>
            <div className="card rounded-2xl border border-rsa-border p-6">
              <p className="text-xs uppercase tracking-widest text-rsa-gold">Action Required</p>
              <p className="mt-3 text-sm text-slate-300">
                {hasCupTiedRole
                  ? 'Review any cup-tied players and resolve roster conflicts before the World Cup stage begins.'
                  : 'Configure the cup tied role in settings to enable World Cup enforcement.'}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="card rounded-2xl border border-rsa-border p-6">
            <h2 className="text-xl font-semibold text-white">Cup-Tied Roster Alerts</h2>
            <p className="mt-2 text-sm text-slate-400">Players with active cup-tied sanctions and current team assignments.</p>

            {cupTiedPlayers.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-slate-400">
                No cup-tied players found. The roster is currently clean.
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-3xl border border-rsa-border bg-slate-950/60">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-slate-900/80 text-left text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3">Sanction</th>
                      <th className="px-4 py-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cupTiedPlayers.map((sanction: any) => (
                      <tr key={sanction.id} className="border-t border-slate-800 even:bg-slate-950/70">
                        <td className="px-4 py-3 text-white">{sanction.playerTag || sanction.playerId}</td>
                        <td className="px-4 py-3 text-slate-300">{sanction.team ?? 'Unknown'}</td>
                        <td className="px-4 py-3 text-slate-300">{sanction.sanctionType}</td>
                        <td className="px-4 py-3 text-slate-400">{new Date(sanction.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
