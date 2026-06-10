import { getTeamByCodeOrName } from '@/lib/db';
import Image from 'next/image';
import { Users, User, Shield, Target, CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

function computeRecord(team: any) {
  let won = 0, drew = 0, lost = 0, goalsFor = 0, goalsAgainst = 0;
  for (const r of team.results ?? []) {
    const isHome = r.homeTeam === team.teamName || r.homeTeam === team.teamCode;
    const isAway = r.awayTeam === team.teamName || r.awayTeam === team.teamCode;
    if (!isHome && !isAway) continue;
    const us = isHome ? r.homeScore : r.awayScore;
    const them = isHome ? r.awayScore : r.homeScore;
    goalsFor += us;
    goalsAgainst += them;
    if (us > them) won++;
    else if (us === them) drew++;
    else lost++;
  }
  const played = won + drew + lost;
  return { played, won, drew, lost, goalsFor, goalsAgainst, goalDifference: goalsFor - goalsAgainst, points: won * 3 + drew };
}

export default async function TeamDetail({ params }: { params: Promise<{ team: string }> }) {
  const resolvedParams = await params;
  const team = await getTeamByCodeOrName(resolvedParams.team) as any;
  if (!team) return <div className="card-panel p-8 text-center font-bold text-muted-foreground">Team not found</div>;

  const manager = team.managerAssignments?.find((m: any) => m.role === 'manager')?.user;
  const assistant = team.managerAssignments?.find((m: any) => m.role === 'assistant')?.user;
  const otherStaff = (team.managerAssignments ?? []).filter((m: any) => m.role !== 'manager' && m.role !== 'assistant');

  // Prefer the official league-table record; fall back to one computed from results.
  const tableEntry = team.leagueTableEntries?.[0];
  const record = tableEntry
    ? {
        played: tableEntry.played, won: tableEntry.won, drew: tableEntry.drew, lost: tableEntry.lost,
        goalsFor: tableEntry.goalsFor, goalsAgainst: tableEntry.goalsAgainst,
        goalDifference: tableEntry.goalDifference, points: tableEntry.points,
      }
    : computeRecord(team);

  const roster = team.rosterPlayers ?? [];

  return (
    <div className="space-y-6">
      <div className="card-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        {/* Decorative background glow based on team primary color (using gold as fallback) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-background border-2 border-border shadow-xl flex items-center justify-center p-3 z-10">
          <div className="relative w-full h-full">
            <Image src={team.logo || `/assets/${(team.teamCode || team.teamName).toLowerCase()}.png`} alt={team.teamName} fill sizes="128px" className="object-contain" priority />
          </div>
        </div>
        <div className="text-center sm:text-left z-10 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-display tracking-tight leading-none">{team.teamName}</h1>
            {team.group ? (
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[0.7rem] font-bold uppercase tracking-wider text-primary self-center sm:self-auto">
                Group {team.group}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-sm font-medium">
            <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
              <User className="w-4 h-4 text-primary" />
              <span>Manager: <span className="text-foreground">{manager?.name ?? '—'}</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
              <Users className="w-4 h-4 text-primary" />
              <span>Squad: <span className="text-foreground">{roster.length}</span> / {team.rosterLimit}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="card-panel overflow-hidden flex flex-col h-[400px]">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground font-display">Active Roster</h2>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              {roster.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {roster.map((r: any) => (
                    <div key={r.id} className="px-4 py-3 rounded-xl bg-background border border-border shadow-sm flex items-center justify-between group hover:border-primary/30 transition-colors">
                      <span className="font-bold text-foreground text-sm truncate">{r.playerTag}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Users className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No players on roster</p>
                </div>
              )}
            </div>
          </section>

          <section className="card-panel overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground font-display">Recent Results</h2>
            </div>
            <div className="p-4">
              {team.results?.length ? (
                <ul className="space-y-2">
                  {team.results.slice(0, 5).map((res: any) => {
                    const isHome = res.homeTeam === team.teamName || res.homeTeam === team.teamCode;
                    const us = isHome ? res.homeScore : res.awayScore;
                    const them = isHome ? res.awayScore : res.homeScore;
                    const won = us > them;
                    const drew = us === them;
                    const resClass = won ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : drew ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-destructive/10 border-destructive/20 text-destructive';
                    const resLabel = won ? 'W' : drew ? 'D' : 'L';

                    return (
                      <li key={res.id} className="flex items-center gap-4 bg-background border border-border rounded-xl p-3 shadow-sm hover:bg-muted/30 transition-colors">
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-sm border ${resClass}`}>
                          {resLabel}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <span className={`text-sm font-bold truncate flex-1 text-right ${isHome ? 'text-foreground' : 'text-muted-foreground'}`}>{res.homeTeam}</span>
                          <span className="px-2.5 py-1 rounded bg-muted text-xs font-mono font-bold text-foreground shrink-0 border border-border">
                            {res.homeScore} - {res.awayScore}
                          </span>
                          <span className={`text-sm font-bold truncate flex-1 ${!isHome ? 'text-foreground' : 'text-muted-foreground'}`}>{res.awayTeam}</span>
                        </div>
                        <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground shrink-0 hidden sm:block">
                          {new Date(res.matchDate).toLocaleDateString()}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-muted-foreground">No results recorded yet</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card-panel p-5">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Management
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Manager</span>
                  <span className="font-bold text-sm text-foreground">{manager?.name ?? '—'}</span>
                </div>
                {manager && <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Assistant</span>
                  <span className="font-bold text-sm text-foreground">{assistant?.name ?? '—'}</span>
                </div>
              </div>
            </div>
            {otherStaff.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-3">Other Staff</p>
                <ul className="space-y-2">
                  {otherStaff.map((s: any) => (
                    <li key={s.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-foreground">{s.user?.name ?? '—'}</span>
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="card-panel p-5">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> Team Record
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-2xl font-bold text-emerald-400 font-display leading-none mb-1">{record.won}</span>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-500/70">Won</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-2xl font-bold text-amber-400 font-display leading-none mb-1">{record.drew}</span>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-500/70">Drawn</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                <span className="text-2xl font-bold text-destructive font-display leading-none mb-1">{record.lost}</span>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-destructive/70">Lost</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Played</span>
                <span className="font-mono font-bold text-foreground">{record.played}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goals For</span>
                <span className="font-mono font-bold text-foreground">{record.goalsFor}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goals Against</span>
                <span className="font-mono font-bold text-foreground">{record.goalsAgainst}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goal Diff</span>
                <span className={`font-mono font-bold ${record.goalDifference > 0 ? 'text-emerald-400' : record.goalDifference < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {record.goalDifference > 0 ? '+' : ''}{record.goalDifference}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 mt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Points</span>
                <span className="text-lg font-mono font-bold text-primary">{record.points}</span>
              </div>
            </div>
          </section>

          <section className="card-panel p-5">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5" /> Upcoming
            </h3>
            {team.fixtures?.length ? (
              <ul className="space-y-3">
                {team.fixtures.map((f: any) => (
                  <li key={f.id} className="p-3 rounded-xl bg-background border border-border shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {new Date(f.kickoff).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {new Date(f.kickoff).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-foreground">
                      <span className="truncate flex-1">{f.homeTeam}</span>
                      <span className="text-[0.65rem] text-muted-foreground px-2">VS</span>
                      <span className="truncate flex-1 text-right">{f.awayTeam}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">No upcoming fixtures</p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
