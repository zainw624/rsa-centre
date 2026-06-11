import React from 'react';
import { Activity } from 'lucide-react';

export default function ActivityCard({ items }: { items: Array<{ id: string; text: string; createdAt?: string }> }) {
  return (
    <div className="card-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Recent Activity</p>
      </div>
      
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <Activity className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground font-medium">No recorded activity</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((it: { id: string; text: string; createdAt?: string }) => (
            <li key={it.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background/50 rounded-lg p-3 border border-border/50">
              <div className="text-sm text-foreground leading-snug">{it.text}</div>
              {it.createdAt && (
                <div className="text-[0.65rem] font-medium text-muted-foreground uppercase tracking-wider shrink-0 sm:text-right">
                  {new Date(it.createdAt).toLocaleString()}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
