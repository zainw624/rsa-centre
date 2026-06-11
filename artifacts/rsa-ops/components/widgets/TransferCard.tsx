import React from 'react';
import { Replace } from 'lucide-react';

export default function TransferCard({ transfers }: { transfers: Array<any> }) {
  return (
    <div className="card-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Recent Transfers</p>
      </div>
      
      {transfers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <Replace className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground font-medium">No recent transfers</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {transfers.map((t: any) => (
            <li key={t.id} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border/50">
              <div className="min-w-0 pr-4">
                <div className="text-sm font-semibold text-foreground truncate mb-0.5">{t.playerTag}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="truncate max-w-[80px]">FA</span>
                  <span className="text-primary text-[0.6rem]">→</span>
                  <span className="truncate max-w-[100px] font-medium text-secondary">{t.toTeam ?? t.team?.teamName}</span>
                </div>
              </div>
              <div className="text-[0.65rem] font-medium text-muted-foreground uppercase tracking-wider shrink-0 text-right">
                {new Date(t.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
