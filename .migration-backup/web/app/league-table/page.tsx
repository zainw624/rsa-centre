import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BrandHeader } from '@/components/BrandHeader';
import { getLeagueTableGroups } from '@/lib/db';

export const dynamic = 'force-dynamic';
export default async function LeagueTablePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const groups = await getLeagueTableGroups();
  const roles = (session.user as any)?.roles ?? [];
  const canManage = roles.includes('RSA | Founders') || roles.includes('RSA | Co Founders') || roles.includes('RSA | Executive') || (session.user as any)?.permission === 'admin';

  return (
    <main className="main-shell">
      <div className="mx-auto w-full max-w-7xl">
        <BrandHeader />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-semibold text-white">League Table</h1>
            <p className="mt-3 text-slate-400">Track league position, competition performance, and team standings across configured seasons.</p>
          </div>

          <aside className="space-y-4 rounded-2xl border border-rsa-border bg-slate-950/70 p-6">
            <p className="text-xs uppercase tracking-widest text-rsa-gold">Access</p>
            <p className="text-sm text-slate-300">{canManage ? 'Your current role grants league table management visibility.' : 'View-only access for this page. League data is managed via the bot and admin roles.'}</p>
          </aside>
        </div>

        {Object.keys(groups).length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-slate-400">
            No league table data is available. Add league table rows through the bot or database to populate this view.
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {(Object.entries(groups) as Array<[string, any[]]>).map(([seasonName, rawRows]) => {
              const rows = Array.isArray(rawRows) ? rawRows : [];

              return (
                <section key={seasonName} className="overflow-hidden rounded-3xl border border-rsa-border bg-slate-950/70">
                  <div className="border-b border-slate-800 bg-slate-900/90 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">{seasonName}</h2>
                    <p className="mt-1 text-sm text-slate-400">{rows.length} teams in the standings</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-950/80 text-slate-400">
                        <tr>
                          <th className="px-5 py-3">#</th>
                          <th className="px-5 py-3">Team</th>
                          <th className="px-5 py-3 text-right">P</th>
                          <th className="px-5 py-3 text-right">W</th>
                          <th className="px-5 py-3 text-right">D</th>
                          <th className="px-5 py-3 text-right">L</th>
                          <th className="px-5 py-3 text-right">GD</th>
                          <th className="px-5 py-3 text-right">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row: any) => (
                          <tr key={row.id} className="border-t border-slate-800 even:bg-slate-950/70">
                            <td className="px-5 py-3 text-slate-300">{row.position}</td>
                            <td className="px-5 py-3 text-white">{row.team?.teamName ?? 'Unknown team'}</td>
                            <td className="px-5 py-3 text-right text-slate-300">{row.played}</td>
                            <td className="px-5 py-3 text-right text-slate-300">{row.won}</td>
                            <td className="px-5 py-3 text-right text-slate-300">{row.drew}</td>
                            <td className="px-5 py-3 text-right text-slate-300">{row.lost}</td>
                            <td className="px-5 py-3 text-right text-slate-300">{row.goalDifference}</td>
                            <td className="px-5 py-3 text-right text-white">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
