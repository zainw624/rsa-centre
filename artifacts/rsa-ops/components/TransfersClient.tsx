"use client";
import React, { useCallback, useEffect, useState } from 'react';
import useLiveUpdates from './LiveUpdates';

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

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div>
        <h3 className="mb-3 text-sm text-slate-400">Latest Transfers</h3>
        <div className="space-y-3">
          {latest.map((t: any) => (
            <div key={t.id} className="card rounded-xl border border-rsa-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white">{t.playerTag} → {t.toTeam ?? t.team?.teamName}</div>
                <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm text-slate-400">Pending Contracts</h3>
        <div className="space-y-3">
          {pending.map((t: any) => (
            <div key={t.id} className="card rounded-xl border border-rsa-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white">{t.playerTag} → {t.toTeam ?? t.team?.teamName}</div>
                <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm text-slate-400">Declined Contracts</h3>
        <div className="space-y-3">
          {declined.map((t: any) => (
            <div key={t.id} className="card rounded-xl border border-rsa-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white">{t.playerTag} → {t.toTeam ?? t.team?.teamName}</div>
                <div className="text-xs text-slate-400">{new Date(t.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
