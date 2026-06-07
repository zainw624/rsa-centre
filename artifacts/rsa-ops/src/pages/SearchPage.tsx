import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearch } from 'wouter';

const SEARCH_TYPES = [
  { value: 'all', label: 'All' }, { value: 'players', label: 'Players' },
  { value: 'teams', label: 'Teams' }, { value: 'managers', label: 'Managers' },
  { value: 'staff', label: 'Staff' }, { value: 'fixtures', label: 'Fixtures' },
  { value: 'results', label: 'Results' }, { value: 'transfers', label: 'Transfers' },
  { value: 'awards', label: 'Awards' },
];

export default function SearchPage() {
  const search = useSearch();
  const initialQ = new URLSearchParams(search).get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [type, setType] = useState('all');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchResults = useCallback(async (q: string, t: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      params.set('q', q.trim());
      if (t !== 'all') params.set('type', t);
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Unable to fetch search results');
      const data = await res.json();
      setResults(data.results || []);
    } catch { setError('Unable to fetch search results.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (initialQ) fetchResults(initialQ, type); }, []); // eslint-disable-line

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); fetchResults(query, type); };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Global Search</p>
        <h1 className="text-2xl font-semibold text-white">Search across players, teams, staff, fixtures and awards</h1>
      </header>
      <form onSubmit={handleSubmit} className="card rounded-3xl p-6 space-y-4">
        <div className="flex gap-3">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search players, teams, fixtures..."
            className="flex-1 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
            style={{ border: '1px solid #1e293b', background: '#020617' }}
          />
          <button type="submit" className="rounded-2xl bg-rsa-gold px-6 py-3 text-sm font-semibold transition hover:brightness-95" style={{ color: '#020617' }}>Search</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SEARCH_TYPES.map(st => (
            <button key={st.value} type="button" onClick={() => setType(st.value)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${type === st.value ? 'bg-rsa-gold font-semibold' : 'text-slate-300 hover:bg-white/5'}`}
              style={type === st.value ? { color: '#020617' } : { border: '1px solid #1e293b' }}>
              {st.label}
            </button>
          ))}
        </div>
      </form>
      {error && <div className="mt-4 text-sm text-rose-300">{error}</div>}
      {loading ? <div className="mt-6 text-slate-400">Searching…</div> : (
        <div className="mt-6 space-y-6">
          {results.map((cat: any) => (
            <div key={cat.category}>
              <h3 className="mb-3 text-sm uppercase tracking-widest text-rsa-gold">{cat.category}</h3>
              <div className="space-y-2">
                {(cat.items ?? []).map((item: any, i: number) => (
                  <div key={item.id ?? i} className="card rounded-2xl p-4 text-sm text-slate-300">
                    {item.playerTag || item.teamName || item.name || item.homeTeam && `${item.homeTeam} vs ${item.awayTeam}` || JSON.stringify(item).slice(0, 80)}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {results.length === 0 && query && !loading && <div className="text-slate-400">No results found for "{query}"</div>}
        </div>
      )}
    </div>
  );
}
