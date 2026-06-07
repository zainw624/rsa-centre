import React from 'react';

export default function FixtureCard({ fixtures }: { fixtures: Array<any> }) {
  return (
    <div className="card rounded-2xl border border-rsa-border p-4">
      <p className="text-xs uppercase tracking-widest text-rsa-gold">Upcoming Fixtures</p>
      <ul className="mt-3 space-y-3">
        {fixtures.map((f: any) => (
          <li key={f.id} className="flex items-center justify-between">
            <div className="text-sm text-white">{f.homeTeam} vs {f.awayTeam}</div>
            <div className="text-xs text-slate-400">{new Date(f.kickoff).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
