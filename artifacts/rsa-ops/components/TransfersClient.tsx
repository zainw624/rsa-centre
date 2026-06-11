"use client";
import React, { useCallback, useEffect, useState } from 'react';
import useLiveUpdates from './LiveUpdates';
import { ArrowRight, Clock, CheckCircle2, XCircle, Replace } from 'lucide-react';

export default function TransfersClient({ initial }: { initial: any[] }) {
  const [latest, setLatest] = useState(initial || []);
  const [pending, setPending] = useState<any[]>([]);
  const [declined, setDeclined] = useState<any[]>([]);

  const refreshLatest = useCallback(async () => {
    const res = await fetch('/api/transfers');
    if (res.ok) setLatest(await res.json());
  }, []);
  const refreshPending = useCallback(async () => {
    const res = await fetch('/api/transfers?status=pending');
    if (res.ok) setPending(await res.json());
  }, []);
  const refreshDeclined = useCallback(async () => {
    const res = await fetch('/api/transfers?status=declined');
    if (res.ok) setDeclined(await res.json());
  }, []);

  useLiveUpdates((payload) => {
    if (!payload) return;
    const { eventType } = payload;
    if (['transferCreated', 'transferUpdated', 'rosterUpdated'].includes(eventType)) {
      refreshLatest();
      refreshPending();
      refreshDeclined();
    }
  });

  useEffect(() => { if (!initial) refreshLatest(); refreshPending(); refreshDeclined(); }, [initial, refreshLatest, refreshPending, refreshDeclined]);

  const renderList = (items: any[], emptyMsg: string, icon: React.ReactNode) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-background/50 rounded-xl border border-dashed border-border">
          <div className="text-muted-foreground/30 mb-2">{icon}</div>
          <p className="text-sm font-medium text-muted-foreground">{emptyMsg}</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {items.map((t: any) => (
          <div key={t.id} className="bg-card border border-border/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-muted border border-border flex items-center justify-center shrink-0">
                <Replace className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{t.playerTag}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <span className="truncate max-w-[100px]">{t.fromTeam || 'Free Agent'}</span>
                  <ArrowRight className="w-3 h-3 text-primary" />
                  <span className="truncate max-w-[100px] font-medium text-foreground">{t.toTeam ?? t.team?.teamName}</span>
                </div>
              </div>
            </div>
            <div className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider shrink-0 bg-muted px-2 py-1 rounded">
              {new Date(t.createdAt || t.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card-panel p-5 bg-card/50 border-none shadow-none">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">Completed</h3>
        </div>
        {renderList(latest, "No recent completed transfers", <CheckCircle2 className="w-8 h-8" />)}
      </div>

      <div className="card-panel p-5 bg-card/50 border-none shadow-none">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-foreground">Pending Approval</h3>
        </div>
        {renderList(pending, "No pending contracts", <Clock className="w-8 h-8" />)}
      </div>

      <div className="card-panel p-5 bg-card/50 border-none shadow-none">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-bold text-foreground">Declined</h3>
        </div>
        {renderList(declined, "No declined contracts", <XCircle className="w-8 h-8" />)}
      </div>
    </div>
  );
}
