import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BrandHeader } from '@/components/BrandHeader';
import StatCard from '@/components/widgets/StatCard';
import StatusCard from '@/components/widgets/StatusCard';
import ActivityCard from '@/components/widgets/ActivityCard';
import FixtureCard from '@/components/widgets/FixtureCard';
import ResultCard from '@/components/widgets/ResultCard';
import TransferCard from '@/components/widgets/TransferCard';
import ComplianceCard from '@/components/widgets/ComplianceCard';
import LeagueTablePreview from '@/components/widgets/LeagueTablePreview';
import {
  getTotals,
  getSettings,
  getUpcomingFixtures,
  getLatestResults,
  getTransfers,
  getRecentActivity,
  getLeagueSnapshot,
  getActiveSanctions,
  getCupTiedPlayers,
  getLeagueHealth,
  getCurrentSeason,
  getPlayerLeaderboard,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

const EMPTY_TOTALS = { playersCount: 0, teamsCount: 0, managersCount: 0, assistantManagersCount: 0, staffCount: 0 };
const EMPTY_HEALTH = { percentCompleted: 0, played: 0, totalFixtures: 0 };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  let totals    = EMPTY_TOTALS;
  let settings: any  = null;
  let fixtures: any[] = [];
  let results: any[]  = [];
  let transfers: any[] = [];
  let activity: any[]  = [];
  let leagueRows: any[] = [];
  let sanctions: any[]  = [];
  let cupTied: any[]   = [];
  let leagueHealth     = EMPTY_HEALTH;
  let season: any      = null;
  let topScorers: any[] = [];
  let dbError          = false;

  try {
    let leaderboard: any;
    [totals, settings, fixtures, results, transfers, activity, leagueRows, sanctions, cupTied, leagueHealth, season, leaderboard] =
      await Promise.all([
        getTotals(),
        getSettings(),
        getUpcomingFixtures(6),
        getLatestResults(6),
        getTransfers(8),
        getRecentActivity(12),
        getLeagueSnapshot(6),
        getActiveSanctions(6),
        getCupTiedPlayers(),
        getLeagueHealth(),
        getCurrentSeason(),
        getPlayerLeaderboard(),
      ]);
    topScorers = leaderboard?.topScorers ?? [];
  } catch {
    dbError = true;
  }

  const userName   = session.user?.name ?? 'RSA Member';
  const permission = session.user?.permission ?? 'viewer';

  return (
    <div className="mx-auto w-full max-w-7xl">
      <BrandHeader
        title={`Welcome back, ${userName.split('#')[0]}`}
        subtitle={`Signed in as ${permission.charAt(0).toUpperCase() + permission.slice(1)}`}
      />

      {dbError && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-4 text-sm text-amber-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>
            <strong className="font-semibold text-amber-200">Database not connected.</strong>{' '}
            Set <code className="rounded bg-black/30 px-1 text-xs">DATABASE_URL</code> in Replit Secrets and run{' '}
            <code className="rounded bg-black/30 px-1 text-xs">npx prisma db push</code> to activate live data.
          </span>
        </div>
      )}

      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total Players"       value={totals.playersCount} />
        <StatCard title="Total Teams"         value={totals.teamsCount} />
        <StatCard title="Managers"            value={totals.managersCount} />
        <StatCard title="Asst. Managers"      value={totals.assistantManagersCount} />
        <StatCard title="Total Staff"         value={totals.staffCount} />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Active Season"
          status={season?.name ?? 'None'}
          hint={season?.name ? 'Current competition season' : 'No active season set'}
        />
        <StatusCard
          title="Transfer Window"
          status={settings?.transferWindowOpen ? 'Open' : 'Closed'}
          hint={settings?.transferWindowOpen ? 'Transfers are being accepted' : 'Transfers are currently closed'}
        />
        <StatusCard
          title="World Cup Mode"
          status={settings?.worldCupMode ? 'Active' : 'Inactive'}
        />
        <StatusCard
          title="League Health"
          status={`${leagueHealth.percentCompleted}% Complete`}
          hint={`Played ${leagueHealth.played} of ${leagueHealth.totalFixtures} fixtures`}
        />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <FixtureCard fixtures={fixtures} />
        <ResultCard  results={results} />
        <TransferCard transfers={transfers} />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityCard items={activity.map((a: any) => ({ id: a.id, text: a.text, createdAt: a.createdAt }))} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-rsa-border bg-white/3 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-rsa-gold">League Leaders</p>
            {topScorers.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">No goals recorded yet</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {topScorers.slice(0, 5).map((p: any, i: number) => (
                  <li key={p.playerId ?? p.id ?? i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 truncate">
                      <span className="w-4 shrink-0 text-xs font-bold text-slate-600">{i + 1}</span>
                      <span className="truncate text-white">{p.playerTag || p.playerName || p.playerId}</span>
                    </span>
                    <span className="shrink-0 font-bold text-rsa-gold">{p.goals ?? p.total ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <LeagueTablePreview rows={leagueRows} />
          <ComplianceCard issues={sanctions} />
          <div className="rounded-2xl border border-rsa-border bg-white/3 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-rsa-gold">Sanctions</p>
            <p className="mt-2 text-2xl font-bold text-white">{sanctions.length}</p>
            <p className="mt-1 text-xs text-slate-500">Active · {cupTied.length} cup-tied</p>
          </div>
        </div>
      </section>
    </div>
  );
}
