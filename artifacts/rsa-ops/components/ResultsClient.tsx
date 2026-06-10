"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ResultsClient({ initial, isAdmin }: { initial: any[]; isAdmin: boolean }) {
  const [results, setResults] = useState(initial || []);
  const [editing, setEditing] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
    setIsCreating(false);
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
    if(!confirm("Are you sure you want to delete this result?")) return;
    await fetch(`/api/results?id=${id}`, { method: 'DELETE' });
    await refresh();
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Cancel' : 'Add Result'}
          </button>
        </div>
      )}

      {isAdmin && isCreating && (
        <form onSubmit={handleCreate} className="card-panel p-5 animate-in fade-in slide-in-from-top-4 border-primary/30">
          <h3 className="text-lg font-bold text-foreground font-display mb-4">Record New Result</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Home Team</label>
              <input name="homeTeam" required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Home Score</label>
              <input name="homeScore" type="number" required min="0" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div className="space-y-1.5 hidden md:block"></div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Away Team</label>
              <input name="awayTeam" required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Away Score</label>
              <input name="awayScore" type="number" required min="0" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div className="space-y-1.5 hidden md:block"></div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Competition</label>
              <input name="competition" defaultValue="RSA Season 2026" required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Match Date</label>
              <input name="matchDate" type="datetime-local" required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 [color-scheme:dark]" />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">Save Result</button>
          </div>
        </form>
      )}

      <div className="card-panel overflow-hidden">
        {results.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground font-medium">No results recorded yet.</div>
        ) : (
          <div className="divide-y divide-border/50">
            {results.map((r: any) => (
              <div key={r.id} className="p-4 sm:p-5 hover:bg-muted/30 transition-colors group">
                {editing?.id === r.id ? (
                  <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-4 items-end bg-background p-4 rounded-xl border border-border">
                    <input name="id" defaultValue={r.id} type="hidden" />
                    <div className="flex-1 w-full grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{r.homeTeam}</label>
                        <input name="homeScore" type="number" min="0" defaultValue={r.homeScore} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{r.awayTeam}</label>
                        <input name="awayScore" type="number" min="0" defaultValue={r.awayScore} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button type="button" onClick={() => setEditing(null)} className="flex-1 sm:flex-none px-4 py-2 bg-muted text-foreground text-sm font-bold rounded-lg hover:bg-muted/80">Cancel</button>
                      <button type="submit" className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90">Save</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 md:gap-6 mb-1">
                        <span className={`text-base sm:text-lg font-bold w-1/3 text-right truncate ${r.homeScore > r.awayScore ? 'text-primary' : 'text-foreground'}`}>{r.homeTeam}</span>
                        <div className="flex items-center justify-center bg-card border border-border/80 rounded-lg px-3 py-1 min-w-[70px] shrink-0 font-mono text-base sm:text-lg font-bold text-foreground">
                          {r.homeScore} - {r.awayScore}
                        </div>
                        <span className={`text-base sm:text-lg font-bold w-1/3 text-left truncate ${r.awayScore > r.homeScore ? 'text-primary' : 'text-foreground'}`}>{r.awayTeam}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium mt-2">
                        <span>{r.competition}</span>
                        <span>•</span>
                        <span>{new Date(r.matchDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-2 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditing(r)} className="p-2 text-muted-foreground hover:text-primary bg-background border border-border rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 bg-background border border-border rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
