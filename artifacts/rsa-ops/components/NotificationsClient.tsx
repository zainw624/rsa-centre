'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, BellRing } from 'lucide-react';

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

  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-1">Notifications</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display tracking-tight">Notification Centre</h1>
          <p className="mt-1 text-sm text-muted-foreground font-medium">Track the latest platform alerts and system events.</p>
        </div>
        <button 
          onClick={markAllRead} 
          disabled={actionsLoading || loading || !hasUnread} 
          className="flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none shrink-0"
        >
          <Check className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      <div className="card-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground font-medium flex items-center justify-center gap-3">
            <BellRing className="w-5 h-5 animate-pulse text-primary" />
            Loading notifications…
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-base font-bold text-foreground">You're all caught up</p>
            <p className="text-sm text-muted-foreground font-medium mt-1">No notifications available.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.map((notification: any) => (
              <article key={notification.id} className={`p-5 transition-colors hover:bg-muted/30 ${!notification.read ? 'bg-primary/5' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.read ? 'bg-primary shadow-[0_0_8px_rgba(201,165,90,0.8)]' : 'bg-transparent'}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                          {notification.type || 'System'}
                        </p>
                        <span className="text-xs font-medium text-muted-foreground">
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-foreground font-display leading-tight">{notification.title}</h2>
                      <p className="mt-1.5 text-sm font-medium text-muted-foreground">{notification.message || 'No message provided.'}</p>
                      
                      {notification.payload && (
                        <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-card p-3 text-[0.7rem] font-mono text-muted-foreground leading-relaxed custom-scrollbar max-w-full">
                          {JSON.stringify(notification.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
