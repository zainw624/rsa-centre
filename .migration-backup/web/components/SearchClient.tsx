'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface ResultCategory {
  category: string;
  items: any[];
}

const SEARCH_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'players', label: 'Players' },
  { value: 'teams', label: 'Teams' },
  { value: 'managers', label: 'Managers' },
  { value: 'staff', label: 'Staff' },
  { value: 'fixtures', label: 'Fixtures' },
  { value: 'results', label: 'Results' },
  { value: 'transfers', label: 'Transfers' },
  { value: 'competitions', label: 'Competitions' },
  { value: 'awards', label: 'Awards' },
];

export default function SearchClient() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState<ResultCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasResults = useMemo(() => results.length > 0, [results]);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      if (type !== 'all') params.set('type', type);
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Unable to fetch search results');
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, type]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (query.trim()) {
        fetchResults();
      }
    }, 500);
    return () => clearTimeout(handle);
  }, [fetchResults, query]);

  return (
    <div className="space-y-6">
      <section className="card rounded-3xl border border-rsa-border p-6">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
          <div>
            <label className="text-sm uppercase tracking-widest text-rsa-gold" htmlFor="global-search">
              Search query
            </label>
            <input
              id="global-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search players, teams, fixtures, transfers, awards..."
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20"
            />
          </div>

          <div>
            <label className="text-sm uppercase tracking-widest text-rsa-gold" htmlFor="search-type">
              Search type
            </label>
            <select
              id="search-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20"
            >
              {SEARCH_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="card rounded-3xl border border-rsa-border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Search results</p>
            <h2 className="text-xl font-semibold text-white">Global search results</h2>
          </div>
          <div className="text-sm text-slate-400">{loading ? 'Searching...' : `${results.length} categories found`}</div>
        </div>

        {error ? (
          <div className="mt-6 rounded-3xl border border-rose-500/50 bg-rose-500/5 p-4 text-sm text-rose-200">{error}</div>
        ) : null}

        <div className="mt-6 space-y-6">
          {!loading && !hasResults && query.trim() ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-sm text-slate-400">No results match your search query. Try using a different name or keyword.</div>
          ) : null}

          {results.map((group) => (
            <section key={group.category} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <h3 className="text-lg font-semibold text-white">{group.category}</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {group.items.map((item, index) => (
                  <div key={`${group.category}-${item.id || item.playerId || index}`} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                    <div className="font-medium text-white">{item.teamName || item.name || item.playerTag || item.role || item.homeTeam || item.title || item.type || item.action || 'Result'}</div>
                    <div className="mt-1 text-slate-400">
                      {group.category === 'Players' && `${item.user?.name || 'Discord user'} · ${item.team?.teamName || 'Unassigned'}`}
                      {group.category === 'Teams' && `Code: ${item.teamCode || item.teamId}`}
                      {group.category === 'Managers' && `${item.user?.name || item.user?.discordId} · ${item.team?.teamName || item.role}`}
                      {group.category === 'Staff' && `${item.name || item.discordId} · ${item.roles?.join(', ')}`}
                      {group.category === 'Fixtures' && `${item.homeTeam} vs ${item.awayTeam} · ${new Date(item.kickoff).toLocaleDateString()}`}
                      {group.category === 'Results' && `${item.homeTeam} ${item.homeScore} - ${item.awayScore} ${item.awayTeam} · ${new Date(item.matchDate).toLocaleDateString()}`}
                      {group.category === 'Transfers' && `${item.playerTag || item.playerId} · ${item.fromTeam || 'N/A'} → ${item.toTeam || 'N/A'}`}
                      {group.category === 'Competitions' && item.name}
                      {group.category === 'Awards' && `${item.name} · ${item.team?.teamName || item.recipientId || item.achievement}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
