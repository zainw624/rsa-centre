'use client';

import { useState } from 'react';

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
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-slate-500">No data yet — seed teams or push results via bot.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(201,165,90,0.14)', background: 'rgba(0,0,0,0.28)' }}>
            {['#', 'Team', 'GP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map((h) => (
              <th
                key={h}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-widest`}
                style={{
                  color: '#c9a55a',
                  textAlign: ['GP','W','D','L','GF','GA','GD','Pts'].includes(h) ? 'right' : 'left',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const name = row.team?.teamName ?? 'Unknown';
            const flag = getFlag(name);
            const isTop2 = i < 2;
            return (
              <tr
                key={row.id}
                style={{
                  borderTop: '1px solid rgba(201,165,90,0.08)',
                  background: i % 2 === 0 ? 'rgba(201,165,90,0.025)' : 'rgba(0,0,0,0.15)',
                  borderLeft: isTop2 ? '2px solid rgba(201,165,90,0.45)' : '2px solid transparent',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,165,90,0.06)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'rgba(201,165,90,0.025)' : 'rgba(0,0,0,0.15)'; }}
              >
                <td className="px-4 py-3" style={{ color: isTop2 ? '#c9a55a' : '#64748b', fontWeight: isTop2 ? 700 : 400 }}>
                  {row.position}
                </td>
                <td className="px-4 py-3">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {flag ? (
                      <img src={flag} alt={name} style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 20, height: 14, borderRadius: 2, background: 'rgba(201,165,90,0.18)', flexShrink: 0 }} />
                    )}
                    <span style={{ color: '#f8f8f4', fontWeight: 500 }}>
                      {name}{name.toLowerCase().includes('united states') ? ' 🏠' : ''}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right" style={{ color: '#94a3b8' }}>{row.played}</td>
                <td className="px-4 py-3 text-right" style={{ color: '#94a3b8' }}>{row.won}</td>
                <td className="px-4 py-3 text-right" style={{ color: '#94a3b8' }}>{row.drew}</td>
                <td className="px-4 py-3 text-right" style={{ color: '#94a3b8' }}>{row.lost}</td>
                <td className="px-4 py-3 text-right" style={{ color: '#94a3b8' }}>{row.goalsFor}</td>
                <td className="px-4 py-3 text-right" style={{ color: '#94a3b8' }}>{row.goalsAgainst}</td>
                <td className="px-4 py-3 text-right" style={{ color: row.goalDifference > 0 ? '#34d399' : row.goalDifference < 0 ? '#f87171' : '#94a3b8' }}>
                  {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                </td>
                <td className="px-4 py-3 text-right" style={{ color: '#f8f8f4', fontWeight: 700 }}>{row.points}</td>
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
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {GROUP_LABELS.map((g) => {
          const active = activeTab === g;
          return (
            <button
              key={g}
              onClick={() => setActiveTab(g)}
              style={{
                padding: '0.45rem 1.2rem',
                borderRadius: '8px',
                border: active ? '1px solid rgba(201,165,90,0.40)' : '1px solid rgba(255,255,255,0.07)',
                background: active ? 'rgba(201,165,90,0.14)' : 'rgba(255,255,255,0.03)',
                color: active ? '#e0b96a' : '#64748b',
                fontWeight: active ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                letterSpacing: '0.06em',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = '#cbd5e1'; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
            >
              Group {g}
            </button>
          );
        })}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.72rem', color: '#334155', letterSpacing: '0.08em' }}>
            ★ Top 2 qualify
          </span>
        </div>
      </div>

      {!hasAny && (
        <div
          style={{
            borderRadius: '16px',
            border: '1px dashed rgba(201,165,90,0.18)',
            background: 'rgba(14,10,3,0.6)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#c9a55a', fontSize: '0.85rem', fontWeight: 600 }}>Groups not seeded yet</p>
          <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: '0.4rem' }}>
            Run <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0 4px', borderRadius: 4 }}>POST /api/admin/seed-groups</code> to initialise Season 2026 groups.
          </p>
        </div>
      )}

      {hasAny && (
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(201,165,90,0.14)',
            background: 'rgba(14,10,3,0.88)',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
          }}
        >
          <div
            style={{
              borderBottom: '1px solid rgba(201,165,90,0.10)',
              background: 'rgba(0,0,0,0.25)',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c9a55a', margin: 0 }}>Group {activeTab}</p>
              <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.1rem 0 0' }}>{groups[activeTab]?.length ?? 0} teams</p>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#334155' }}>RSA Season 2026</span>
          </div>
          <GroupTable rows={groups[activeTab] ?? []} />
        </div>
      )}
    </div>
  );
}
