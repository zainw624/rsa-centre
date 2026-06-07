import React from 'react';

export default function StatusCard({ title, status, hint }: { title: string; status: string; hint?: string }) {
  const isGood = status === 'Open' || status === 'Healthy' || status === 'Active';
  return (
    <div className="card rounded-2xl border border-rsa-border p-4">
      <p className="text-xs uppercase tracking-widest text-rsa-gold">{title}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-white">{status}</div>
        <div className={`rounded-full px-3 py-1 text-sm font-medium ${isGood ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}`}>
          {isGood ? 'Good' : 'Attention'}
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
