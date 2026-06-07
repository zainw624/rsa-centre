import { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to load notifications');
      setNotifications(await res.json());
    } catch { setError('Unable to load notifications at this time.'); }
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    setActionsLoading(true); setError('');
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to mark notifications read');
      await loadNotifications();
    } catch { setError('Unable to update notifications.'); }
    finally { setActionsLoading(false); }
  };

  useEffect(() => { loadNotifications(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Notifications</p>
          <h1 className="text-2xl font-semibold text-white">Notification centre</h1>
          <p className="mt-2 text-sm text-slate-400">Track the latest platform alerts.</p>
        </div>
        <button onClick={markAllRead} disabled={actionsLoading || loading} className="rounded-2xl bg-rsa-gold px-4 py-2 text-sm font-semibold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60" style={{ color: '#020617' }}>
          Mark all read
        </button>
      </div>
      {error ? <div className="rounded-3xl p-4 text-sm text-rose-200" style={{ border: '1px solid rgba(244,63,94,0.4)', background: 'rgba(244,63,94,0.05)' }}>{error}</div> : null}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl p-6 text-slate-400" style={{ border: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)' }}>Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl p-6 text-slate-400" style={{ border: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)' }}>No notifications available.</div>
        ) : notifications.map((n: any) => (
          <article key={n.id} className="rounded-3xl p-5" style={{ border: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)' }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-widest text-rsa-gold">{n.type || 'Notification'}</p>
                <h2 className="mt-2 text-lg font-semibold text-white">{n.title}</h2>
              </div>
              <div className="text-right text-xs text-slate-500">{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Unknown'}</div>
            </div>
            <p className="mt-3 text-sm text-slate-300">{n.message || 'No message provided.'}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
