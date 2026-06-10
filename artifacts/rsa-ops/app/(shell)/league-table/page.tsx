import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLeagueTableGroups, getGroupStandings } from '@/lib/db';
import GroupTabsClient from '@/components/GroupTabsClient';
import { can } from '@/lib/permissions';
import { BrandHeader } from '@/components/BrandHeader';
import { Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LeagueTablePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  let groups: Record<string, any[]> = {};
  let seasonGroups: Record<string, any[]> = {};
  let dbError = false;

  try {
    [groups, seasonGroups] = await Promise.all([
      getGroupStandings(),
      getLeagueTableGroups(),
    ]);
  } catch {
    dbError = true;
  }

  const perm = (session.user as any)?.permission ?? '';
  const canManage = can(perm, 'recalcStandings');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <BrandHeader
          title="League Standings"
          subtitle="RSA Season 2026 current group standings and rankings"
        />
        {canManage && (
          <div className="shrink-0 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <Lock className="w-4 h-4" />
            Admin Access
          </div>
        )}
      </div>

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view group standings</p>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <GroupTabsClient groups={groups} />
          </section>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-card border border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-[2px] bg-primary shadow-sm" />
              <span>Qualifies for knockouts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 rounded">+GD</span>
              <span>Positive Difference</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-destructive bg-destructive/10 px-1.5 rounded">−GD</span>
              <span>Negative Difference</span>
            </div>
          </div>

          {/* Season-based tables */}
          {Object.keys(seasonGroups).length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                <h2 className="text-lg font-bold text-foreground font-display tracking-tight">Archived Seasons</h2>
              </div>
              
              <div className="grid gap-6">
                {(Object.entries(seasonGroups) as Array<[string, any[]]>).map(([seasonName, rawRows]) => {
                  const rows = Array.isArray(rawRows) ? rawRows : [];
                  return (
                    <div key={seasonName} className="card-panel overflow-hidden">
                      <div className="px-5 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
                        <h3 className="text-base font-bold text-foreground font-display">{seasonName}</h3>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">
                          {rows.length} teams
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead>
                            <tr className="bg-card border-b border-border text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                              {['#', 'Team', 'GP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map((h) => (
                                <th key={h} className={`px-4 py-3 ${['GP','W','D','L','GF','GA','GD','Pts'].includes(h) ? 'text-right' : ''}`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {rows.map((row: any, i: number) => (
                              <tr key={row.id} className={`hover:bg-muted/30 transition-colors ${i % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                                <td className="px-4 py-3 text-muted-foreground font-mono">{row.position}</td>
                                <td className="px-4 py-3 font-semibold text-foreground">{row.team?.teamName ?? 'Unknown'}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.played}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.won}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.drew}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.lost}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.goalsFor}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.goalsAgainst}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.goalDifference}</td>
                                <td className="px-4 py-3 text-right font-bold text-foreground font-mono">{row.points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
