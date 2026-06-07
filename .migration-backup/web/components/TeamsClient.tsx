"use client";
import React, { useCallback, useEffect, useState } from 'react';
import TeamCard from './TeamCard';
import useLiveUpdates from './LiveUpdates';

export default function TeamsClient({ initial }: { initial: any[] }) {
  const [teams, setTeams] = useState(initial || []);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/teams');
    if (res.ok) {
      const list = await res.json();
      setTeams(list);
    }
  }, []);

  useLiveUpdates((payload) => {
    if (!payload) return;
    const { eventType } = payload;
    if (['teamUpdated', 'rosterUpdated', 'transferCreated', 'transferUpdated'].includes(eventType)) {
      refresh();
    }
  });

  useEffect(() => {
    // initial hydration
    if (!initial) refresh();
  }, [initial, refresh]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((t: any) => (
        <TeamCard key={t.id} team={t} />
      ))}
    </div>
  );
}
