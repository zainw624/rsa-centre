import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLeagueTableGroups } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LeagueTablePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  let groups: Record<string, any[]> = {};
  let dbError = false;

  try {
    groups = await getLeagueTableGroups();
  } catch {
    dbError = true;
  }

  const perm = (session.user as any)?.permission ?? '';
  const canManage = perm === 'owner' || perm === 'administrator' || perm === 'league';

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">League Table</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">League Standings</h1>
          <p className="mt-1 text-sm text-slate-500">Team standings across all configured seasons</p>
        </div>
        {canManage && (
          <span className="shrink-0 rounded-full border border-rsa-gold/30 bg-rsa-gold/10 px-3 py-1.5 text-xs font-semibold text-rsa-gold">
            Management Access
          </span>
        )}
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view the league table</p>
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-white/3 px-5 py-12 text-center">
          <p className="text-sm text-slate-400">No league table data available</p>
          <p className="mt-1 text-xs text-slate-600">Add league table rows through the bot or database to populate this view</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groups) as Array<[string, any[]]>).map(([seasonName, rawRows]) => {
            const rows = Array.isArray(rawRows) ? rawRows : [];
            return (
              <section key={seasonName} className="overflow-hidden rounded-2xl border border-rsa-border">
                <div className="border-b border-rsa-border bg-white/3 px-5 py-4">
                  <h2 className="text-base font-semibold text-white">{seasonName}</h2>
                  <p className="text-xs text-slate-500">{rows.length} teams</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-rsa-border bg-black/20">
                        {['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => (
                          <th key={h} className={`px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 ${['P','W','D','L','GD','Pts'].includes(h) ? 'text-right' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row: any, i: number) => (
                        <tr key={row.id} className={`border-t border-rsa-border ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                          <td className="px-5 py-3 text-slate-400">{row.position}</td>
                          <td className="px-5 py-3 font-medium text-white">{row.team?.teamName ?? 'Unknown'}</td>
                          <td className="px-5 py-3 text-right text-slate-300">{row.played}</td>
                          <td className="px-5 py-3 text-right text-slate-300">{row.won}</td>
                          <td className="px-5 py-3 text-right text-slate-300">{row.drew}</td>
                          <td className="px-5 py-3 text-right text-slate-300">{row.lost}</td>
                          <td className="px-5 py-3 text-right text-slate-300">{row.goalDifference}</td>
                          <td className="px-5 py-3 text-right font-bold text-white">{row.points}</td>
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
  );
}
