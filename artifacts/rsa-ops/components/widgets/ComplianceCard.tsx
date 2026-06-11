import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function ComplianceCard({ issues }: { issues: Array<any> }) {
  const hasIssues = issues.length > 0;
  
  return (
    <div className={`card-panel p-5 flex flex-col h-full ${hasIssues ? 'border-destructive/30 bg-destructive/5' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <p className={`text-[0.65rem] font-bold uppercase tracking-wider ${hasIssues ? 'text-destructive' : 'text-emerald-400'}`}>
          Compliance Health
        </p>
        {hasIssues && <ShieldAlert className="w-4 h-4 text-destructive" />}
      </div>
      
      {!hasIssues ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-sm text-foreground font-semibold mb-1">Zero open issues</p>
          <p className="text-xs text-muted-foreground">League compliance is healthy</p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-destructive font-display leading-none">{issues.length}</span>
            <span className="text-sm font-medium text-destructive/80 mb-0.5">open issues</span>
          </div>
          <ul className="space-y-2 mt-auto">
            {issues.slice(0, 4).map((it: any) => (
              <li key={it.id} className="text-xs font-medium text-foreground bg-background/50 border border-destructive/20 rounded p-2 truncate">
                {it.title ?? it.text ?? JSON.stringify(it)}
              </li>
            ))}
            {issues.length > 4 && (
              <li className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground text-center pt-2">
                + {issues.length - 4} more
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
