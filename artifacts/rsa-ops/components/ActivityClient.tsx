'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface ActivityEvent {
  id: string;
  type: string;
  text: string;
  emoji?: string | null;
  metadata?: unknown;
  playerId?: string | null;
  playerTag?: string | null;
  teamName?: string | null;
  teamId?: string | null;
  staffId?: string | null;
  fixtureId?: string | null;
  sanctionId?: string | null;
  createdAt?: string | null;
}

interface FilterOption {
  id: string;
  label: string;
}

export default function ActivityClient({
  initialEvents,
  players,
  teams,
  staff,
  eventTypes,
}: {
  initialEvents: ActivityEvent[];
  players: FilterOption[];
  teams: FilterOption[];
  staff: FilterOption[];
  eventTypes: string[];
}) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents || []);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ playerId: '', teamId: '', staffId: '', type: '', startDate: '', endDate: '' });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    (Object.entries(filters) as Array<[keyof typeof filters, string]>).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('limit', '100');
    return params.toString();
  }, [filters]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/activity?${queryString}`);
      if (res.ok) {
        setEvents(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-6">
      <section className="card rounded-3xl border border-rsa-border p-6">
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-5">
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Event filters</p>
            <h2 className="text-xl font-semibold text-white">Filter activity by player, team, staff, type, and date</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:col-span-3">
            <label className="block text-sm text-slate-300">
              Player
              <select value={filters.playerId} onChange={(e) => setFilters((prev) => ({ ...prev, playerId: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-rsa-gold">
                <option value="">All players</option>
                {players.map((player: FilterOption) => (
                  <option key={player.id} value={player.id}>{player.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Team
              <select value={filters.teamId} onChange={(e) => setFilters((prev) => ({ ...prev, teamId: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-rsa-gold">
                <option value="">All teams</option>
                {teams.map((team: FilterOption) => (
                  <option key={team.id} value={team.id}>{team.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Staff
              <select value={filters.staffId} onChange={(e) => setFilters((prev) => ({ ...prev, staffId: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-rsa-gold">
                <option value="">All staff</option>
                {staff.map((member: FilterOption) => (
                  <option key={member.id} value={member.id}>{member.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Event type
              <select value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-rsa-gold">
                <option value="">All types</option>
                {eventTypes.map((typeOption: string) => (
                  <option key={typeOption} value={typeOption}>{typeOption}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Start date
              <input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-rsa-gold" />
            </label>
            <label className="block text-sm text-slate-300">
              End date
              <input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-rsa-gold" />
            </label>
          </div>
        </div>
      </section>

      <section className="card rounded-3xl border border-rsa-border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Activity log</p>
            <h2 className="text-xl font-semibold text-white">Latest 100 activity events</h2>
          </div>
          <div className="text-sm text-slate-400">{loading ? 'Loading...' : `Showing ${events.length} events`}</div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
          <table className="w-full border-collapse text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No events found for the selected filters.</td>
                </tr>
              ) : (
                events.map((event: ActivityEvent) => (
                  <tr key={event.id} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-900/60">
                    <td className="px-4 py-3 align-top">{event.createdAt ? new Date(event.createdAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 align-top">{event.text}</td>
                    <td className="px-4 py-3 align-top">{event.playerTag || event.playerId || '—'}</td>
                    <td className="px-4 py-3 align-top">{event.teamName || '—'}</td>
                    <td className="px-4 py-3 align-top">{event.staffId || '—'}</td>
                    <td className="px-4 py-3 align-top">{event.type}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
