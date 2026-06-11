import React from 'react';
import { Calendar } from 'lucide-react';

export default function FixtureCard({ fixtures }: { fixtures: Array<any> }) {
  return (
    <div className="card-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Upcoming Fixtures</p>
      </div>
      
      {fixtures.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground font-medium">No scheduled fixtures</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {fixtures.map((f: any) => (
            <li key={f.id} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{f.homeTeam}</span>
                <span className="text-[0.65rem] font-bold text-muted-foreground uppercase">vs</span>
                <span className="text-sm font-semibold text-foreground">{f.awayTeam}</span>
              </div>
              <div className="text-[0.65rem] font-medium text-muted-foreground uppercase tracking-wider text-right">
                <div>{new Date(f.kickoff).toLocaleDateString()}</div>
                <div className="text-primary">{new Date(f.kickoff).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
