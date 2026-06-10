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
import { Users, ShieldAlert, AlertTriangle } from 'lucide-react';

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
    <div className="space-y-6">
      <BrandHeader
        title={`Welcome back, ${userName.split('#')[0]}`}
        subtitle={`Signed in as ${permission.charAt(0).toUpperCase() + permission.slice(1)}`}
      />

      {dbError && (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-3 text-amber-500">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm">
              <strong className="font-semibold text-amber-400">Database not connected.</strong>{' '}
              Set <code className="rounded bg-background/50 px-1.5 py-0.5 text-xs font-mono text-amber-200">DATABASE_URL</code> in Replit Secrets and run{' '}
              <code className="rounded bg-background/50 px-1.5 py-0.5 text-xs font-mono text-amber-200">npx prisma db push</code> to activate live data.
            </span>
          </div>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total Players"       value={totals.playersCount} />
        <StatCard title="Total Teams"         value={totals.teamsCount} />
        <StatCard title="Managers"            value={totals.managersCount} />
        <StatCard title="Asst. Managers"      value={totals.assistantManagersCount} />
        <StatCard title="Total Staff"         value={totals.staffCount} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          status={`${leagueHealth.percentCompleted}%`}
          hint={`Played ${leagueHealth.played} of ${leagueHealth.totalFixtures} fixtures`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <FixtureCard fixtures={fixtures} />
        <ResultCard  results={results} />
        <TransferCard transfers={transfers} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityCard items={activity.map((a: any) => ({ id: a.id, text: a.text, createdAt: a.createdAt }))} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="card-panel p-5">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-4">League Leaders</p>
            {topScorers.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No goals recorded yet</div>
            ) : (
              <ul className="space-y-3">
                {topScorers.slice(0, 5).map((p: any, i: number) => (
                  <li key={p.playerId ?? p.id ?? i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center shrink-0 text-xs font-bold text-muted-foreground">{i + 1}</span>
                      <span className="truncate text-foreground font-medium">{p.playerTag || p.playerName || p.playerId}</span>
                    </span>
                    <span className="shrink-0 font-bold text-primary px-2 py-0.5 rounded bg-primary/10">{p.goals ?? p.total ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <LeagueTablePreview rows={leagueRows} />
          <ComplianceCard issues={sanctions} />
          <div className="card-panel p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-destructive">Sanctions</p>
              <ShieldAlert className="w-4 h-4 text-destructive/50" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-destructive font-display">{sanctions.length}</p>
              <p className="text-sm font-medium text-destructive/80">active</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-medium">Including {cupTied.length} cup-tied players</p>
          </div>
        </div>
      </section>
    </div>
  );
}
