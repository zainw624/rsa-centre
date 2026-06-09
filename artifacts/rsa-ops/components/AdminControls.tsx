'use client';

import { useState } from 'react';

export default function AdminControls() {
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

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-rsa-border bg-slate-950/80 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Discord sync</p>
            <h2 className="text-xl font-semibold text-white">Sync Discord now</h2>
          </div>
          <button
            type="button"
            onClick={syncDiscord}
            disabled={syncing}
            className="rounded-2xl bg-rsa-gold px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {syncing ? 'Syncing…' : 'Sync Discord now'}
          </button>
        </div>
        {syncStatus ? <p className="mt-4 text-sm text-slate-300">{syncStatus}</p> : null}
        <p className="mt-3 text-sm text-slate-400">
          Pulls every member from Discord and updates teams, rosters, managers and staff to match current roles. Players are placed on a single team by their team role; Free Agents are never rostered.
        </p>
      </div>

      <div className="rounded-3xl border border-rsa-border bg-slate-950/80 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Backup controls</p>
            <h2 className="text-xl font-semibold text-white">Platform backup</h2>
          </div>
          <button
            type="button"
            onClick={triggerBackup}
            disabled={loading}
            className="rounded-2xl bg-rsa-gold px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Triggering...' : 'Trigger backup'}
          </button>
        </div>
        {status ? <p className="mt-4 text-sm text-slate-300">{status}</p> : null}
        <p className="mt-3 text-sm text-slate-400">Backups are recorded in the audit log and stored by the platform backup service.</p>
      </div>
    </div>
  );
}
