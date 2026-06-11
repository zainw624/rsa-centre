import React from 'react';

export default function StatusCard({ title, status, hint }: { title: string; status: string; hint?: string }) {
  const isGood = status === 'Open' || status === 'Healthy' || status === 'Active' || status === 'Season 1' || status === 'Configured';
  // Adjust good criteria broadly for presentation
  const isWarning = status === 'Attention' || status === 'Missing';
  const isNeutral = !isGood && !isWarning;

  const bgClass = isGood ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  isWarning ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-400';

  return (
    <div className="card-panel p-5 flex flex-col h-full group hover:bg-muted/5 transition-colors">
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">{title}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="text-xl font-bold text-foreground font-display leading-none">{status}</div>
        <div className={`shrink-0 rounded px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider border ${bgClass}`}>
          {isGood ? 'Good' : isWarning ? 'Attention' : 'Status'}
        </div>
      </div>
      {hint && <p className="mt-3 text-xs text-muted-foreground font-medium">{hint}</p>}
    </div>
  );
}
