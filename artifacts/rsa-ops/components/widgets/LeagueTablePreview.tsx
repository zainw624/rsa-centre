import React from 'react';
import { ListOrdered } from 'lucide-react';

export default function LeagueTablePreview({ rows }: { rows: Array<any> }) {
  return (
    <div className="card-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-primary">League Table Snapshot</p>
      </div>
      
      {rows.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <ListOrdered className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground font-medium">No standings available</p>
        </div>
      ) : (
        <div className="bg-background/50 rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left w-8">#</th>
                <th className="px-3 py-2 text-left">Team</th>
                <th className="px-3 py-2 text-right w-12">P</th>
                <th className="px-3 py-2 text-right w-12">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {rows.map((r: any) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 text-muted-foreground font-mono">{r.position}</td>
                  <td className="px-3 py-2 font-semibold text-foreground truncate max-w-[120px]">{r.team?.teamName ?? '—'}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground font-mono">{r.played}</td>
                  <td className="px-3 py-2 text-right font-bold text-foreground font-mono">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
