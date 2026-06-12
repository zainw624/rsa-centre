'use client';

import { useState } from 'react';
import { Home } from 'lucide-react';

type TableRow = {
  id: string;
  position: number;
  team?: { teamName?: string; teamCode?: string; logo?: string } | null;
  played: number;
  won: number;
  drew: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type Props = {
  groups: Record<string, TableRow[]>;
};

const GROUP_LABELS = ['A', 'B', 'C', 'D'];

const FLAG_MAP: Record<string, string> = {
  'United States': 'usa',
  'USA': 'usa',
  'Norway': 'norway',
  'Croatia': 'croatia',
  'Japan': 'japan',
  'Ghana': 'ghana',
  'Turkiye': 'turkiye',
  'Türkiye': 'turkiye',
  'Brazil': 'brazil',
  'Belgium': 'belgium',
  'Portugal': 'portugal',
  'England': 'england',
  'France': 'france',
  'Spain': 'spain',
  'Netherlands': 'netherlands',
  'Germany': 'germany',
  'Senegal': 'senegal',
  'Morocco': 'morocco',
};

function getFlag(teamName: string): string | null {
  for (const [key, val] of Object.entries(FLAG_MAP)) {
    if (teamName?.toLowerCase().includes(key.toLowerCase())) return `/assets/${val}.png`;
  }
  return null;
}

function GroupTable({ rows }: { rows: TableRow[] }) {
  if (!rows.length) {
    return (
      <div className="p-8 text-center bg-card rounded-b-2xl border-t border-border/50">
        <p className="text-sm text-muted-foreground">No data yet — seed teams or push results via bot.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-b-2xl">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-muted border-y border-border">
            {['#', 'Team', 'GP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map((h, i) => (
              <th
                key={h}
                className={`px-4 py-3 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground ${
                  ['GP','W','D','L','GF','GA','GD','Pts'].includes(h) ? 'text-right' : ''
                } ${h === '#' ? 'w-10' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50 bg-card">
          {rows.map((row, i) => {
            const name = row.team?.teamName ?? 'Unknown';
            const flag = getFlag(name);
            const isTop2 = i < 2;
            const isHost = name.toLowerCase().includes('united states') || name.toLowerCase() === 'usa';
            return (
              <tr
                key={row.id}
                className={`hover:bg-muted/50 transition-colors ${i % 2 === 0 ? 'bg-card' : 'bg-muted/10'} relative`}
              >
                <td className="px-4 py-3 font-mono relative">
                  {isTop2 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                  <span className={isTop2 ? 'text-primary font-bold' : 'text-muted-foreground'}>{row.position}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {flag ? (
                      <div className="relative w-5 h-[14px] rounded-[2px] overflow-hidden border border-border/50 shadow-sm shrink-0">
                        <img src={flag} alt={name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-5 h-[14px] rounded-[2px] bg-muted border border-border/50 shrink-0" />
                    )}
                    <span className="font-semibold text-foreground truncate flex items-center gap-1.5">
                      {name}
                      {isHost && <Home className="w-3 h-3 text-primary" aria-label="Host Nation" />}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.played}</td>
                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.won}</td>
                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.drew}</td>
                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.lost}</td>
                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.goalsFor}</td>
                <td className="px-4 py-3 text-right text-muted-foreground font-mono">{row.goalsAgainst}</td>
                <td className="px-4 py-3 text-right font-mono font-medium">
                  <span className={row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                    {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-foreground font-mono">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function GroupTabsClient({ groups }: Props) {
  const [activeTab, setActiveTab] = useState<string>('A');

  const hasAny = Object.values(groups).some((g) => g.length > 0);

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center p-1 rounded-xl bg-card border border-border/80 shadow-sm">
          {GROUP_LABELS.map((g) => {
            const active = activeTab === g;
            return (
              <button
                key={g}
                onClick={() => setActiveTab(g)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  active 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                Group {g}
              </button>
            );
          })}
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Top 2 Qualify</span>
        </div>
      </div>

      {!hasAny ? (
        <div className="card-panel border-dashed p-10 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-primary mb-2">Groups not seeded yet</p>
          <p className="text-sm text-muted-foreground font-medium">
            Run <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground mx-1">POST /api/admin/seed-groups</code> to initialise Season 2026 groups.
          </p>
        </div>
      ) : (
        <div className="card-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground font-display tracking-tight">Group {activeTab}</h3>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{groups[activeTab]?.length ?? 0} teams</p>
            </div>
            <div className="text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded">
              RSA Season 2026
            </div>
          </div>
          <GroupTable rows={groups[activeTab] ?? []} />
        </div>
      )}
    </div>
  );
}
