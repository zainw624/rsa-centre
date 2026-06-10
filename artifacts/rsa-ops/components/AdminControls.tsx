'use client';

import { useState } from 'react';
import { Database, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AdminControls({ canBackup = false, canSync = false }: { canBackup?: boolean; canSync?: boolean }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncing, setSyncing] = useState(false);

  const triggerBackup = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/administration/backup', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Backup failed');
      setStatus(body.message || 'Backup triggered successfully.');
    } catch (err) {
      setStatus('Unable to trigger backup.');
    } finally {
      setLoading(false);
    }
  };

  const syncDiscord = async () => {
    setSyncing(true);
    setSyncStatus('');
    try {
      const res = await fetch('/api/admin/sync-discord', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || body?.error || 'Sync failed');
      setSyncStatus(body.message || 'Discord sync complete.');
    } catch (err: any) {
      setSyncStatus(err?.message || 'Unable to sync Discord.');
    } finally {
      setSyncing(false);
    }
  };

  if (!canSync && !canBackup) return null;

  return (
    <div className="space-y-4">
      {canSync && (
        <div className="card-panel p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-1">Discord Integration</p>
              <h2 className="text-lg font-bold text-foreground font-display">Sync Members</h2>
              <p className="text-xs text-muted-foreground font-medium mt-1 max-w-sm">
                Pulls all members from Discord and updates teams, rosters, managers and staff to match current roles. Free Agents are never rostered.
              </p>
            </div>
            <button
              type="button"
              onClick={syncDiscord}
              disabled={syncing}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Sync Discord'}
            </button>
          </div>
          {syncStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium ${syncStatus.includes('failed') || syncStatus.includes('Unable') ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              {syncStatus.includes('failed') || syncStatus.includes('Unable') ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {syncStatus}
            </div>
          )}
        </div>
      )}

      {canBackup && (
        <div className="card-panel p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-primary mb-1">Data Management</p>
              <h2 className="text-lg font-bold text-foreground font-display">Platform Backup</h2>
              <p className="text-xs text-muted-foreground font-medium mt-1 max-w-sm">
                Backups are recorded in the audit log and stored by the platform backup service.
              </p>
            </div>
            <button
              type="button"
              onClick={triggerBackup}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-card border border-border px-4 py-2 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-muted disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto shrink-0"
            >
              <Database className="w-4 h-4 text-muted-foreground" />
              {loading ? 'Triggering...' : 'Trigger Backup'}
            </button>
          </div>
          {status && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium ${status.includes('failed') || status.includes('Unable') ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              {status.includes('failed') || status.includes('Unable') ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {status}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
