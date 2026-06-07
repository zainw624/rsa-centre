import React from 'react';

export default function ComplianceCard({ issues }: { issues: Array<any> }) {
  return (
    <div className="card rounded-2xl border border-rsa-border p-4">
      <p className="text-xs uppercase tracking-widest text-rsa-gold">Compliance</p>
      <div className="mt-3 text-sm text-white">Open issues: <span className="font-semibold">{issues.length}</span></div>
      <ul className="mt-3 space-y-2 text-xs text-slate-400">
        {issues.slice(0, 5).map((it: any) => (
          <li key={it.id}>{it.title ?? it.text ?? JSON.stringify(it)}</li>
        ))}
      </ul>
    </div>
  );
}
