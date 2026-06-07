import { useEffect, useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';

export default function LeagueTablePage() {
  const [groups, setGroups] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/league-table').then(r => r.json()).then(setGroups).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <main className="main-shell">
      <div className="mx-auto w-full max-w-7xl">
        <BrandHeader />
        <div className="mt-6">
          <h1 className="text-3xl font-semibold text-white">League Table</h1>
          <p className="mt-3 text-slate-400">Track league position, competition performance, and team standings across configured seasons.</p>
        </div>
        {loading ? <div className="mt-6 text-slate-400">Loading…</div> : Object.keys(groups).length === 0 ? (
          <div className="mt-6 rounded-3xl p-8 text-slate-400" style={{ border: '1px dashed #334155', background: 'rgba(15,23,42,0.5)' }}>
            No league table data is available yet.
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {(Object.entries(groups) as Array<[string, any[]]>).map(([seasonName, rows]) => (
              <section key={seasonName} className="overflow-hidden rounded-3xl" style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(15,23,42,0.7)' }}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid #1e293b', background: 'rgba(15,23,42,0.9)' }}>
                  <h2 className="text-xl font-semibold text-white">{seasonName}</h2>
                  <p className="mt-1 text-sm text-slate-400">{rows.length} teams in the standings</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-slate-400" style={{ background: 'rgba(15,23,42,0.8)' }}>
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
                      {rows.map((r: any) => (
                        <tr key={r.id} style={{ borderTop: '1px solid #1e293b' }}>
                          <td className="px-5 py-3 text-slate-300">{r.position}</td>
                          <td className="px-5 py-3 text-white">{r.team?.teamName ?? '—'}</td>
                          <td className="px-5 py-3 text-slate-300 text-right">{r.played}</td>
                          <td className="px-5 py-3 text-slate-300 text-right">{r.won}</td>
                          <td className="px-5 py-3 text-slate-300 text-right">{r.drawn}</td>
                          <td className="px-5 py-3 text-slate-300 text-right">{r.lost}</td>
                          <td className="px-5 py-3 text-slate-300 text-right">{r.goalDifference ?? r.gd ?? '—'}</td>
                          <td className="px-5 py-3 font-semibold text-white text-right">{r.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
