'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';

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
      <div className="card-panel p-6">
        <div className="grid gap-6 md:grid-cols-[1fr_200px]">
          <div className="relative group">
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-2 block" htmlFor="global-search">
              Global Search
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                id="global-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search players, teams, fixtures, transfers, awards..."
                className="w-full bg-background border-2 border-border rounded-xl pl-12 pr-4 py-3.5 text-base text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-2 block" htmlFor="search-type">
              Filter by Type
            </label>
            <select
              id="search-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none shadow-sm cursor-pointer"
            >
              {SEARCH_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
          <div>
            <h2 className="text-xl font-bold text-foreground font-display tracking-tight">Search Results</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {query.trim() ? `Showing results for "${query}"` : 'Enter a query to begin searching'}
            </p>
          </div>
          <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-1 rounded flex items-center gap-2">
            {loading ? <><Loader2 className="w-3 h-3 animate-spin text-primary" /> Searching</> : `${results.length} categories`}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-sm font-medium text-destructive flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="space-y-8">
          {!loading && !hasResults && query.trim() ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Search className="w-10 h-10 text-muted-foreground/30 mb-4" />
              <p className="text-base font-bold text-foreground">No matches found</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">Try adjusting your search terms or changing the filter type.</p>
            </div>
          ) : null}

          {results.map((group) => (
            <section key={group.category} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-foreground font-display">{group.category}</h3>
                <span className="text-[0.65rem] font-bold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">{group.items.length}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, index) => (
                  <div key={`${group.category}-${item.id || item.playerId || index}`} className="p-4 rounded-xl bg-background border border-border/80 hover:border-primary/40 transition-colors shadow-sm">
                    <div className="font-bold text-foreground truncate mb-1 text-sm">
                      {item.teamName || item.name || item.playerTag || item.role || item.homeTeam || item.title || item.type || item.action || 'Result'}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">
                      {group.category === 'Players' && `${item.user?.name || 'Discord user'} · ${item.team?.teamName || 'Unassigned'}`}
                      {group.category === 'Teams' && (item.teamCode ? `Code: ${item.teamCode}` : '')}
                      {group.category === 'Managers' && `${item.user?.name || 'Unknown'} · ${item.team?.teamName || item.role}`}
                      {group.category === 'Staff' && `${item.name || 'Unknown'} · ${item.roles?.join(', ')}`}
                      {group.category === 'Fixtures' && `${item.homeTeam} vs ${item.awayTeam} · ${new Date(item.kickoff).toLocaleDateString()}`}
                      {group.category === 'Results' && `${item.homeTeam} ${item.homeScore} - ${item.awayScore} ${item.awayTeam} · ${new Date(item.matchDate).toLocaleDateString()}`}
                      {group.category === 'Transfers' && `${item.playerTag || 'Unknown'} · ${item.fromTeam || 'N/A'} → ${item.toTeam || 'N/A'}`}
                      {group.category === 'Competitions' && item.name}
                      {group.category === 'Awards' && `${item.name} · ${item.team?.teamName || item.achievement || '—'}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
