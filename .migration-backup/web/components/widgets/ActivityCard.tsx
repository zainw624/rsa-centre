import React from 'react';

export default function ActivityCard({ items }: { items: Array<{ id: string; text: string; createdAt?: string }> }) {
  return (
    <div className="card rounded-2xl border border-rsa-border p-4">
      <p className="text-xs uppercase tracking-widest text-rsa-gold">Recent Activity</p>
      <ul className="mt-3 space-y-3">
        {items.map((it: { id: string; text: string; createdAt?: string }) => (
          <li key={it.id} className="flex items-start justify-between">
            <div className="text-sm text-slate-200">{it.text}</div>
            <div className="text-xs text-slate-400">{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
