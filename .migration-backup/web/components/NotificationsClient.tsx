'use client';

import { useEffect, useState } from 'react';

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to load notifications');
      setNotifications(await res.json());
    } catch (err) {
      setError('Unable to load notifications at this time.');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    setActionsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to mark notifications read');
      await loadNotifications();
    } catch (err) {
      setError('Unable to update notifications.');
    } finally {
      setActionsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Notifications</p>
          <h1 className="text-2xl font-semibold text-white">Notification centre</h1>
          <p className="mt-2 text-sm text-slate-400">Track the latest platform alerts and take action on unread items.</p>
        </div>
        <button onClick={markAllRead} disabled={actionsLoading || loading} className="rounded-2xl border border-rsa-border bg-rsa-gold px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60">
          Mark all read
        </button>
      </div>

      {error ? <div className="rounded-3xl border border-rose-500/40 bg-rose-500/5 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-400">Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-400">No notifications available.</div>
        ) : (
          notifications.map((notification: any) => (
            <article key={notification.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-widest text-rsa-gold">{notification.type || 'Notification'}</p>
                  <h2 className="mt-2 text-lg font-semibold text-white">{notification.title}</h2>
                </div>
                <div className="text-right text-xs text-slate-500">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Unknown'}</div>
              </div>
              <p className="mt-3 text-sm text-slate-300">{notification.message || 'No message provided.'}</p>
              {notification.payload ? (
                <pre className="mt-3 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400">{JSON.stringify(notification.payload, null, 2)}</pre>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
