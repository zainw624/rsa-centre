import { useCallback, useEffect, useState } from 'react';

export default function TransfersPage() {
  const [latest, setLatest] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [declined, setDeclined] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    Promise.all([
      refreshLatest(),
      refreshPending(),
      refreshDeclined(),
      fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [refreshLatest, refreshPending, refreshDeclined]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Transfers</p>
        <h1 className="text-2xl font-semibold text-white">Recent transfers</h1>
      </header>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-slate-400">Transfer Window</div>
        <div className="text-sm font-semibold text-white">{settings?.transferWindowOpen ? 'Open' : 'Closed'}</div>
      </div>

      {loading ? <div className="text-slate-400">Loading…</div> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm text-slate-400">Latest Transfers</h3>
            <div className="space-y-3">
              {latest.length === 0 ? <div className="text-sm text-slate-500">No transfers yet.</div> : latest.map((t: any) => (
                <div key={t.id} className="card rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white">{t.playerTag} → {t.toTeam ?? t.team?.teamName ?? '—'}</div>
                    <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm text-slate-400">Pending Contracts</h3>
            <div className="space-y-3">
              {pending.length === 0 ? <div className="text-sm text-slate-500">No pending contracts.</div> : pending.map((t: any) => (
                <div key={t.id} className="card rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white">{t.playerTag} → {t.toTeam ?? '—'}</div>
                    <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm text-slate-400">Declined Contracts</h3>
            <div className="space-y-3">
              {declined.length === 0 ? <div className="text-sm text-slate-500">No declined contracts.</div> : declined.map((t: any) => (
                <div key={t.id} className="card rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white">{t.playerTag} → {t.toTeam ?? '—'}</div>
                    <div className="text-xs text-slate-400">{new Date(t.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
