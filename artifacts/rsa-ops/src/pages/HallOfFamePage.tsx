import { useEffect, useState } from 'react';

export default function HallOfFamePage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hall-of-fame').then(r => r.json()).then(setSeasons).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Hall of Fame</p>
        <h1 className="text-2xl font-semibold text-white">Legendary winners and historic achievements</h1>
      </header>
      {loading ? <div className="text-slate-400">Loading…</div> : seasons.length === 0 ? (
        <div className="card rounded-3xl p-6 text-slate-400">No Hall of Fame entries have been recorded yet.</div>
      ) : (
        <div className="space-y-6">
          {seasons.map((season: any) => (
            <section key={season.id} className="card rounded-3xl p-6">
              <div>
                <p className="text-sm uppercase tracking-widest text-rsa-gold">Season</p>
                <h2 className="text-xl font-semibold text-white">{season.name}{season.current ? ' · Current' : ''}</h2>
                <div className="text-sm text-slate-400">{(season.hallOfFameEntries ?? []).length} entries · {(season.awards ?? []).length} awards</div>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Hall of Fame</h3>
                  {(season.hallOfFameEntries ?? []).length === 0 ? <p className="text-slate-500">No entries yet.</p> : (season.hallOfFameEntries ?? []).map((e: any) => (
                    <div key={e.id} className="mb-3 rounded-3xl p-4" style={{ border: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)' }}>
                      <div className="font-semibold text-white">{e.playerTag}</div>
                      <div className="text-slate-400">{e.achievement}</div>
                      <div className="mt-2 text-xs text-slate-500">Year: {e.year}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Season awards</h3>
                  {(season.awards ?? []).length === 0 ? <p className="text-slate-500">No awards yet.</p> : (season.awards ?? []).map((a: any) => (
                    <div key={a.id} className="mb-3 rounded-3xl p-4" style={{ border: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)' }}>
                      <div className="font-semibold text-white">{a.name}</div>
                      <div className="text-slate-400">{a.recipientId ? a.recipientId : a.team?.teamName || a.achievement || 'Winner'}</div>
                      <div className="mt-2 text-xs text-slate-500">Awarded: {a.awardedAt ? new Date(a.awardedAt).toLocaleDateString() : 'Unknown'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
