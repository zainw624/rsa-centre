'use client';

import { useState } from 'react';

export default function AdminControls() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
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
  );
}
