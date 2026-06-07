import React from 'react';

export default function ResultCard({ results }: { results: Array<any> }) {
  return (
    <div className="card rounded-2xl border border-rsa-border p-4">
      <p className="text-xs uppercase tracking-widest text-rsa-gold">Latest Results</p>
      <ul className="mt-3 space-y-3">
        {results.map((r: any) => (
          <li key={r.id} className="flex items-center justify-between">
            <div className="text-sm text-white">{r.homeTeam} {r.homeScore} - {r.awayScore} {r.awayTeam}</div>
            <div className="text-xs text-slate-400">{new Date(r.matchDate).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
