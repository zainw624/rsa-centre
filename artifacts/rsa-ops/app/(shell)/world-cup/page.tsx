import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StatCard from '@/components/widgets/StatCard';
import StatusCard from '@/components/widgets/StatusCard';
import { getWorldCupOverview } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function WorldCupPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  let overview: any = { settings: null, cupTiedPlayers: [], activeSanctions: [], totalTeams: 0 };
  let dbError = false;

  try {
    overview = await getWorldCupOverview();
  } catch {
    dbError = true;
  }

  const { settings, cupTiedPlayers, activeSanctions, totalTeams } = overview;
  const worldCupActive = settings?.worldCupMode ?? false;
  const hasCupTiedRole = Boolean(settings?.cupTiedRoleId);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">World Cup</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">World Cup Mode</h1>
        <p className="mt-1 text-sm text-slate-500">Tournament roster lock, cup-tied enforcement and World Cup status</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view World Cup data</p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="World Cup Mode"    value={worldCupActive ? 'Active' : 'Inactive'} />
            <StatCard title="Teams Monitored"   value={totalTeams} />
            <StatCard title="Active Sanctions"  value={activeSanctions.length} />
            <StatusCard
              title="Cup-Tied Role"
              status={hasCupTiedRole ? 'Configured' : 'Missing'}
              hint={hasCupTiedRole ? 'Cup tied enforcement can run' : 'Set cup tied role in settings'}
            />
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-rsa-border bg-white/3 p-5">
              <h2 className="text-base font-semibold text-white">World Cup Status</h2>
              <p className="mt-3 text-sm text-slate-400">
                {worldCupActive
                  ? 'World Cup mode is enabled and the system is enforcing cup-tied restrictions. Only leadership may make roster changes.'
                  : 'World Cup roster lock is not active. Regular squad and transfer rules are currently in effect.'}
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-rsa-border bg-black/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Cup-Tied Players</p>
                  <p className="mt-2 text-3xl font-bold text-white">{cupTiedPlayers.length}</p>
                </div>
                <div className="rounded-xl border border-rsa-border bg-black/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">World Cup Sanctions</p>
                  <p className="mt-2 text-3xl font-bold text-white">{activeSanctions.length}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <StatusCard
                title="Roster Lock"
                status={worldCupActive ? 'Locked' : 'Unlocked'}
                hint={worldCupActive ? 'World Cup roster changes are restricted.' : 'Normal roster management is allowed.'}
              />
              <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Action Required</p>
                <p className="mt-3 text-sm text-slate-400">
                  {hasCupTiedRole
                    ? 'Review cup-tied players and resolve roster conflicts before the World Cup stage begins.'
                    : 'Configure the cup-tied role in settings to enable World Cup enforcement.'}
                </p>
              </div>
            </div>
          </section>

          {cupTiedPlayers.length > 0 && (
            <section className="mt-5 rounded-2xl border border-rsa-border bg-white/3 p-5">
              <h2 className="mb-4 text-base font-semibold text-white">Cup-Tied Roster Alerts</h2>
              <div className="overflow-x-auto rounded-xl border border-rsa-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rsa-border bg-black/20">
                      {['Player', 'Team', 'Sanction', 'Date'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cupTiedPlayers.map((sanction: any) => (
                      <tr key={sanction.id} className="border-t border-rsa-border">
                        <td className="px-4 py-3 text-white">{sanction.playerTag || sanction.playerId}</td>
                        <td className="px-4 py-3 text-slate-300">{sanction.team ?? 'Unknown'}</td>
                        <td className="px-4 py-3 text-slate-300">{sanction.sanctionType}</td>
                        <td className="px-4 py-3 text-slate-400">{new Date(sanction.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
