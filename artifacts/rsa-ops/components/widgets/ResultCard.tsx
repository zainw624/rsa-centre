import React from 'react';
import { CalendarDays } from 'lucide-react';

export default function ResultCard({ results }: { results: Array<any> }) {
  return (
    <div className="card-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Latest Results</p>
      </div>
      
      {results.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <CalendarDays className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground font-medium">No recent results</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {results.map((r: any) => (
            <li key={r.id} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{r.homeTeam}</span>
                <span className="px-2 py-0.5 rounded bg-muted text-xs font-bold text-foreground font-mono">
                  {r.homeScore} - {r.awayScore}
                </span>
                <span className="text-sm font-semibold text-foreground">{r.awayTeam}</span>
              </div>
              <div className="text-[0.65rem] font-medium text-muted-foreground uppercase tracking-wider">
                {new Date(r.matchDate).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
