import React from 'react';

export default function TransferCard({ transfers }: { transfers: Array<any> }) {
  return (
    <div className="card rounded-2xl border border-rsa-border p-4">
      <p className="text-xs uppercase tracking-widest text-rsa-gold">Recent Transfers</p>
      <ul className="mt-3 space-y-3">
        {transfers.map((t: any) => (
          <li key={t.id} className="flex items-center justify-between">
            <div className="text-sm text-white">{t.playerTag} → {t.toTeam ?? t.team?.teamName}</div>
            <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
