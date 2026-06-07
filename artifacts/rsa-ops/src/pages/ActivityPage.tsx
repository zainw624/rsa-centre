import { useCallback, useEffect, useMemo, useState } from 'react';

interface ActivityEvent {
  id: string; type: string; text: string; emoji?: string | null;
  playerId?: string | null; playerTag?: string | null; teamName?: string | null;
  teamId?: string | null; staffId?: string | null; createdAt?: string | null;
}

interface FilterOption { id: string; label: string; }

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<FilterOption[]>([]);
  const [teams, setTeams] = useState<FilterOption[]>([]);
  const [staff, setStaff] = useState<FilterOption[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState({ playerId: '', teamId: '', staffId: '', type: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetch('/api/activity/options').then(r => r.json()).then((d: any) => {
      setPlayers(d.players ?? []); setTeams(d.teams ?? []); setStaff(d.staff ?? []); setEventTypes(d.eventTypes ?? []);
    }).catch(() => {});
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    (Object.entries(filters) as Array<[string, string]>).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('limit', '100');
    return params.toString();
  }, [filters]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/activity?${queryString}`);
      if (res.ok) setEvents(await res.json());
    } finally { setLoading(false); }
  }, [queryString]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return (
    <div className="space-y-6">
      <section className="card rounded-3xl p-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Event filters</p>
        <h2 className="text-xl font-semibold text-white">Filter activity</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm text-slate-300">Player
            <select value={filters.playerId} onChange={e => setFilters(p => ({ ...p, playerId: e.target.value }))} className="mt-2 w-full rounded-2xl px-3 py-2 text-white outline-none" style={{ border: '1px solid #1e293b', background: '#020617' }}>
              <option value="">All players</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>
          <label className="block text-sm text-slate-300">Team
            <select value={filters.teamId} onChange={e => setFilters(p => ({ ...p, teamId: e.target.value }))} className="mt-2 w-full rounded-2xl px-3 py-2 text-white outline-none" style={{ border: '1px solid #1e293b', background: '#020617' }}>
              <option value="">All teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          <label className="block text-sm text-slate-300">Event type
            <select value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))} className="mt-2 w-full rounded-2xl px-3 py-2 text-white outline-none" style={{ border: '1px solid #1e293b', background: '#020617' }}>
              <option value="">All types</option>
              {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block text-sm text-slate-300">Start date
            <input type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} className="mt-2 w-full rounded-2xl px-3 py-2 text-white outline-none" style={{ border: '1px solid #1e293b', background: '#020617' }} />
          </label>
          <label className="block text-sm text-slate-300">End date
            <input type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} className="mt-2 w-full rounded-2xl px-3 py-2 text-white outline-none" style={{ border: '1px solid #1e293b', background: '#020617' }} />
          </label>
        </div>
      </section>

      <section className="card rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Activity log</p>
            <h2 className="text-xl font-semibold text-white">Latest activity events</h2>
          </div>
          <div className="text-sm text-slate-400">{loading ? 'Loading...' : `Showing ${events.length} events`}</div>
        </div>
        <div className="overflow-hidden rounded-3xl" style={{ border: '1px solid #1e293b', background: '#020617' }}>
          <table className="w-full border-collapse text-left text-sm text-slate-300">
            <thead style={{ borderBottom: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)' }} className="text-slate-400">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No events found.</td></tr>
              ) : events.map((event) => (
                <tr key={event.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td className="px-4 py-3 align-top">{event.createdAt ? new Date(event.createdAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 align-top">{event.text}</td>
                  <td className="px-4 py-3 align-top">{event.playerTag || event.playerId || '—'}</td>
                  <td className="px-4 py-3 align-top">{event.teamName || '—'}</td>
                  <td className="px-4 py-3 align-top">{event.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
