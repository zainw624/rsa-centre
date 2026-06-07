import { useEffect, useState } from 'react';

export default function AdministrationPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [backupStatus, setBackupStatus] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    fetch('/api/administration').then(r => r.json()).then(setSummary).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const triggerBackup = async () => {
    setBackupLoading(true); setBackupStatus('');
    try {
      const res = await fetch('/api/administration/backup', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Backup failed');
      setBackupStatus(body.message || 'Backup triggered successfully.');
    } catch { setBackupStatus('Unable to trigger backup.'); }
    finally { setBackupLoading(false); }
  };

  if (loading) return <div className="text-slate-400">Loading…</div>;

  const settings = summary?.settings ?? {};

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="mb-4">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Administration</p>
        <h1 className="text-2xl font-semibold text-white">Platform administration</h1>
        <p className="mt-2 text-sm text-slate-400">Monitor platform health, audit records and system sync status.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl p-6" style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(15,23,42,0.8)' }}>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Platform health</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div>Platform status: <span className="font-semibold text-emerald-400">Healthy</span></div>
            <div>Database: <span className="font-semibold text-emerald-400">Connected</span></div>
            <div>Discord sync: <span className="font-semibold text-emerald-400">Online</span></div>
          </div>
        </div>

        <div className="rounded-3xl p-6" style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(15,23,42,0.8)' }}>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Compliance</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div>Active sanctions: <span className="font-semibold text-white">{summary?.activeSanctions ?? 0}</span></div>
            <div>Cup tied players: <span className="font-semibold text-white">{summary?.cupTied ?? 0}</span></div>
            <div>Pending transfers: <span className="font-semibold text-white">{summary?.pendingTransfers ?? 0}</span></div>
            <div>Registered users: <span className="font-semibold text-white">{summary?.userCount ?? 0}</span></div>
          </div>
        </div>

        <div className="rounded-3xl p-6" style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(15,23,42,0.8)' }}>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Platform settings</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div>Transfer window: <span className="font-semibold text-white">{settings.transferWindowOpen ? 'Open' : 'Closed'}</span></div>
            <div>World Cup mode: <span className="font-semibold text-white">{settings.worldCupMode ? 'Active' : 'Inactive'}</span></div>
            <div>Free agent role: <span className="font-semibold text-white">{settings.freeAgentRoleName || 'Not configured'}</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-6" style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(15,23,42,0.8)' }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Backup controls</p>
            <h2 className="text-xl font-semibold text-white">Platform backup</h2>
          </div>
          <button type="button" onClick={triggerBackup} disabled={backupLoading} className="rounded-2xl bg-rsa-gold px-4 py-2 text-sm font-semibold transition hover:brightness-95 disabled:opacity-60" style={{ color: '#020617' }}>
            {backupLoading ? 'Triggering...' : 'Trigger backup'}
          </button>
        </div>
        {backupStatus && <p className="mt-4 text-sm text-slate-300">{backupStatus}</p>}
        <p className="mt-3 text-sm text-slate-400">Backups are recorded in the audit log and stored by the platform backup service.</p>
      </div>
    </div>
  );
}
