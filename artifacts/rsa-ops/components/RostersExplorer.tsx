"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';

type Section = 'all' | 'players' | 'managers' | 'staff';

function logoPath(team: any) {
  if (team?.logo) return team.logo;
  const code = (team?.teamCode || team?.teamName || 'usa').toString().toLowerCase();
  return `/assets/${code}.png`;
}

export default function RostersExplorer({ teams }: { teams: any[] }) {
  const sorted = useMemo(
    () => [...teams].sort((a, b) => (a.teamName || '').localeCompare(b.teamName || '')),
    [teams],
  );
  const [selectedId, setSelectedId] = useState<string>(sorted[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<Section>('all');

  const team = sorted.find((t) => t.id === selectedId) ?? sorted[0];
  if (!team) return null;

  const q = query.trim().toLowerCase();
  const manager = team.managerAssignments?.find((m: any) => m.role === 'manager')?.user;
  const assistant = team.managerAssignments?.find((m: any) => m.role === 'assistant')?.user;
  const staff = (team.managerAssignments ?? []).filter((m: any) => m.role !== 'manager' && m.role !== 'assistant');

  const players = (team.rosterPlayers ?? []).filter((p: any) =>
    !q || (p.playerTag || '').toLowerCase().includes(q),
  );

  const matchesQuery = (name?: string) => !q || (name || '').toLowerCase().includes(q);
  const showPlayers = section === 'all' || section === 'players';
  const showManagers = section === 'all' || section === 'managers';
  const showStaff = section === 'all' || section === 'staff';

  const filters: { key: Section; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'players', label: 'Players' },
    { key: 'managers', label: 'Managers' },
    { key: 'staff', label: 'Staff' },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Team selector */}
      <aside className="flex flex-col h-full max-h-[800px]">
        <label className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-3">Select a team</label>
        <div className="card-panel flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {sorted.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-left transition-colors ${
                t.id === team.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <div className="relative w-7 h-7 shrink-0 rounded overflow-hidden bg-background border border-border/50 flex items-center justify-center p-0.5">
                <Image src={logoPath(t)} alt={t.teamName} fill sizes="28px" className="object-contain" />
              </div>
              <span className="truncate text-sm font-semibold">{t.teamName}</span>
              {t.group ? <span className="ml-auto text-[0.65rem] font-bold uppercase text-muted-foreground px-1.5 py-0.5 rounded bg-muted/50 border border-border">{t.group}</span> : null}
            </button>
          ))}
        </div>
      </aside>

      {/* Selected team */}
      <section className="space-y-4 min-w-0">
        <div className="card-panel p-5 flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-background border border-border shadow-sm flex items-center justify-center p-1.5">
            <Image src={logoPath(team)} alt={team.teamName} fill sizes="64px" className="object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground font-display tracking-tight">{team.teamName}</h2>
            <div className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              {team.group ? <span className="uppercase text-[0.65rem] font-bold tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">Group {team.group}</span> : null}
              <span><strong className="text-foreground">{team.rosterPlayers?.length ?? 0}</strong> / {team.rosterLimit} players</span>
            </div>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
          <div className="relative max-w-sm w-full group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="w-full bg-card border border-border/80 rounded-xl pl-9 pr-4 py-2 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setSection(f.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  section === f.key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card border border-border/80 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {showManagers && (
            <div className="card-panel p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Managers</h3>
              <div className="space-y-2">
                {(matchesQuery(manager?.name) || matchesQuery(assistant?.name)) ? (
                  <>
                    {matchesQuery(manager?.name) && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                        <span className="text-sm font-semibold text-foreground">{manager?.name ?? '—'}</span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">Manager</span>
                      </div>
                    )}
                    {matchesQuery(assistant?.name) && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                        <span className="text-sm font-semibold text-foreground">{assistant?.name ?? '—'}</span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">Assistant</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic px-2">No matching managers.</p>
                )}
              </div>
            </div>
          )}

          {showStaff && (
            <div className="card-panel p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Team Staff</h3>
              {staff.filter((s: any) => matchesQuery(s.user?.name)).length ? (
                <div className="space-y-2">
                  {staff.filter((s: any) => matchesQuery(s.user?.name)).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                      <span className="text-sm font-semibold text-foreground">{s.user?.name ?? '—'}</span>
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">{s.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic px-2">No additional staff assigned.</p>
              )}
            </div>
          )}
          
          {showPlayers && (
            <div className="card-panel p-5 md:col-span-2 lg:col-span-1 xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Players</h3>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">{players.length}</span>
              </div>
              
              {players.length ? (
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {players.map((p: any) => (
                    <div key={p.id} className="px-3 py-2 rounded-lg bg-background/50 border border-border/50 text-sm font-medium text-foreground truncate">
                      {p.playerTag}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic px-2">No players match your search.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
