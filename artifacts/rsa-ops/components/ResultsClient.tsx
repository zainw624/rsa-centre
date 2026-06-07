"use client";
import React, { useCallback, useEffect, useState } from 'react';

export default function ResultsClient({ initial, isAdmin }: { initial: any[]; isAdmin: boolean }) {
  const [results, setResults] = useState(initial || []);
  const [editing, setEditing] = useState<any | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/results');
    if (res.ok) setResults(await res.json());
  }, []);

  useEffect(() => {
    if (!initial) refresh();
  }, [initial, refresh]);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const payload = Object.fromEntries(form as any);
    await fetch('/api/results', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    await refresh();
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const payload = Object.fromEntries(form as any);
    await fetch('/api/results', { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    setEditing(null);
    await refresh();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/results?id=${id}`, { method: 'DELETE' });
    await refresh();
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <form onSubmit={handleCreate} className="card p-4">
          <h3 className="text-white">Add Result</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input name="homeTeam" placeholder="Home Team" className="input" />
            <input name="awayTeam" placeholder="Away Team" className="input" />
            <input name="homeScore" placeholder="Home Score" className="input" />
            <input name="awayScore" placeholder="Away Score" className="input" />
            <input name="competition" placeholder="Competition" className="input" />
            <input name="matchDate" placeholder="Match Date (ISO)" className="input" />
          </div>
          <div className="mt-3">
            <button className="btn">Create</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {results.map((r: any) => (
          <div key={r.id} className="card p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white">{r.homeTeam} {r.homeScore} - {r.awayScore} {r.awayTeam}</div>
                <div className="text-xs text-slate-400">{r.competition} — {new Date(r.matchDate).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button onClick={() => setEditing(r)} className="text-sm text-rsa-gold">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-sm text-red-500">Delete</button>
                  </>
                )}
              </div>
            </div>
            {editing?.id === r.id && (
              <form onSubmit={handleUpdate} className="mt-3">
                <input name="id" defaultValue={r.id} type="hidden" />
                <input name="homeScore" defaultValue={r.homeScore} className="input" />
                <input name="awayScore" defaultValue={r.awayScore} className="input" />
                <button className="btn mt-2">Save</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
