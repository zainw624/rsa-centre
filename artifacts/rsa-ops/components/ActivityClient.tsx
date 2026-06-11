'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, Search, Calendar, FileText, User, Users, ShieldAlert, Activity } from 'lucide-react';

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

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6">
      <div className="card-panel p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Filter Activity</h2>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><User className="w-3 h-3"/> Player</label>
            <select value={filters.playerId} onChange={(e) => setFilters((prev) => ({ ...prev, playerId: e.target.value }))} className="w-full bg-background border border-border/80 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none">
              <option value="">All players</option>
              {players.map((player: FilterOption) => (
                <option key={player.id} value={player.id}>{player.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Users className="w-3 h-3"/> Team</label>
            <select value={filters.teamId} onChange={(e) => setFilters((prev) => ({ ...prev, teamId: e.target.value }))} className="w-full bg-background border border-border/80 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none">
              <option value="">All teams</option>
              {teams.map((team: FilterOption) => (
                <option key={team.id} value={team.id}>{team.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><ShieldAlert className="w-3 h-3"/> Staff</label>
            <select value={filters.staffId} onChange={(e) => setFilters((prev) => ({ ...prev, staffId: e.target.value }))} className="w-full bg-background border border-border/80 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none">
              <option value="">All staff</option>
              {staff.map((member: FilterOption) => (
                <option key={member.id} value={member.id}>{member.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Activity className="w-3 h-3"/> Event type</label>
            <select value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))} className="w-full bg-background border border-border/80 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none">
              <option value="">All types</option>
              {eventTypes.map((typeOption: string) => (
                <option key={typeOption} value={typeOption}>{typeOption}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Start date</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 [color-scheme:dark]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3 h-3"/> End date</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 [color-scheme:dark]" />
          </div>
        </div>
      </div>

      <div className="card-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground font-display">Activity Log</h2>
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">
            {loading ? 'Loading...' : `${events.length} events`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-card border-b border-border text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3 w-full">Event</th>
                <th className="px-5 py-3">Player</th>
                <th className="px-5 py-3">Team</th>
                <th className="px-5 py-3">Staff</th>
                <th className="px-5 py-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No events found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                events.map((event: ActivityEvent, i) => (
                  <tr key={event.id} className={`hover:bg-muted/30 transition-colors ${i % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}>
                    <td className="px-5 py-3 text-xs font-medium text-muted-foreground align-top">
                      {event.createdAt ? new Date(event.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground align-top whitespace-normal min-w-[250px]">{event.text}</td>
                    <td className="px-5 py-3 text-muted-foreground align-top">{event.playerTag || event.playerId || '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground align-top">{event.teamName || '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground align-top">{event.staffId || '—'}</td>
                    <td className="px-5 py-3 align-top">
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
                        {event.type}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
