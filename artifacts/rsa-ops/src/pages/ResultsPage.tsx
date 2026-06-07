import { useCallback, useEffect, useState } from 'react';

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/results');
    if (res.ok) setResults(await res.json());
  }, []);

  useEffect(() => { refresh().finally(() => setLoading(false)); }, [refresh]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Results</p>
        <h1 className="text-2xl font-semibold text-white">Match results</h1>
      </header>
      {loading ? <div className="text-slate-400">Loading…</div> : (
        <div className="space-y-3">
          {results.length === 0 ? <div className="text-slate-400">No results yet.</div> : results.map((r: any) => (
            <div key={r.id} className="card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-white">{r.homeTeam} <span className="text-rsa-gold">{r.homeScore} – {r.awayScore}</span> {r.awayTeam}</div>
                <div className="text-sm text-slate-400">{new Date(r.matchDate).toLocaleDateString()}</div>
              </div>
              {r.competition && <div className="mt-1 text-xs text-slate-500">{r.competition}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
