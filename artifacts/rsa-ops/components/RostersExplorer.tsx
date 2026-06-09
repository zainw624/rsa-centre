"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';

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
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Team selector */}
      <aside className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Select a team</label>
        <div className="grid max-h-[60vh] gap-1 overflow-auto rounded-2xl border border-rsa-border bg-white/3 p-2">
          {sorted.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                t.id === team.id ? 'bg-rsa-gold/15 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded">
                <Image src={logoPath(t)} alt={t.teamName} fill sizes="24px" className="object-contain" />
              </span>
              <span className="truncate">{t.teamName}</span>
              {t.group ? <span className="ml-auto text-xs text-slate-500">{t.group}</span> : null}
            </button>
          ))}
        </div>
      </aside>

      {/* Selected team */}
      <section className="space-y-5">
        <div className="card flex items-center gap-4 rounded-2xl border border-rsa-border p-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
            <Image src={logoPath(team)} alt={team.teamName} fill sizes="56px" className="object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{team.teamName}</h2>
            <div className="text-sm text-slate-400">
              {team.group ? `Group ${team.group} · ` : ''}{(team.rosterPlayers?.length ?? 0)}/{team.rosterLimit} players
            </div>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-2xl border border-rsa-border bg-slate-950/60 px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:border-rsa-gold/50 focus:outline-none sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setSection(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  section === f.key ? 'bg-rsa-gold text-slate-950' : 'border border-rsa-border text-slate-300 hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {showManagers && (
          <div className="card rounded-2xl border border-rsa-border p-4">
            <h3 className="text-sm font-semibold text-white">Managers</h3>
            <div className="mt-3 space-y-1.5 text-sm text-slate-300">
              {(matchesQuery(manager?.name) || matchesQuery(assistant?.name)) ? (
                <>
                  {matchesQuery(manager?.name) && <div className="flex justify-between"><span>{manager?.name ?? '—'}</span><span className="text-xs text-slate-500">Manager</span></div>}
                  {matchesQuery(assistant?.name) && <div className="flex justify-between"><span>{assistant?.name ?? '—'}</span><span className="text-xs text-slate-500">Assistant Manager</span></div>}
                </>
              ) : (
                <p className="text-slate-500">No matching managers.</p>
              )}
            </div>
          </div>
        )}

        {showStaff && (
          <div className="card rounded-2xl border border-rsa-border p-4">
            <h3 className="text-sm font-semibold text-white">Staff</h3>
            {staff.filter((s: any) => matchesQuery(s.user?.name)).length ? (
              <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                {staff.filter((s: any) => matchesQuery(s.user?.name)).map((s: any) => (
                  <li key={s.id} className="flex justify-between"><span>{s.user?.name ?? '—'}</span><span className="text-xs text-slate-500">{s.role}</span></li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No additional staff assigned.</p>
            )}
          </div>
        )}

        {showPlayers && (
          <div className="card rounded-2xl border border-rsa-border p-4">
            <h3 className="text-sm font-semibold text-white">Players <span className="text-xs font-normal text-slate-500">({players.length})</span></h3>
            {players.length ? (
              <ul className="mt-3 grid gap-1.5 text-sm text-slate-300 sm:grid-cols-2">
                {players.map((p: any) => (
                  <li key={p.id} className="rounded-lg bg-white/3 px-3 py-1.5">{p.playerTag}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No players match your search.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
