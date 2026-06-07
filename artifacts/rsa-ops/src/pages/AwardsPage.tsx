import { useEffect, useState } from 'react';

export default function AwardsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/awards').then(r => r.json()).then(setSeasons).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Awards Centre</p>
        <h1 className="text-2xl font-semibold text-white">Season awards and winners</h1>
      </header>
      {loading ? <div className="text-slate-400">Loading…</div> : seasons.length === 0 ? (
        <div className="card rounded-3xl p-6 text-slate-400">No awards have been recorded yet.</div>
      ) : (
        <div className="space-y-6">
          {seasons.map((season: any) => (
            <section key={season.id} className="card rounded-3xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-widest text-rsa-gold">Season</p>
                  <h2 className="text-xl font-semibold text-white">{season.name}{season.current ? ' · Current' : ''}</h2>
                </div>
                <div className="text-sm text-slate-400">{(season.awards ?? []).length} award entries</div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {(season.awards ?? []).length === 0 ? <p className="text-slate-500">No awards recorded.</p> : (season.awards ?? []).map((a: any) => (
                  <div key={a.id} className="rounded-3xl p-4" style={{ border: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)' }}>
                    <div className="font-semibold text-white">{a.name}</div>
                    <div className="mt-2 text-slate-300">{a.description || a.achievement || 'Award winner'}</div>
                    <div className="mt-3 text-sm text-slate-400">Recipient: {a.recipientId || a.team?.teamName || 'Unassigned'}</div>
                    <div className="text-xs text-slate-500">Awarded: {a.awardedAt ? new Date(a.awardedAt).toLocaleDateString() : 'Unknown'}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
