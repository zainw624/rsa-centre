import React from 'react';

export default function StatCard({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="card-panel p-5 flex flex-col justify-between h-full group hover:bg-muted/5 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">{title}</p>
        {icon && <div className="text-muted-foreground/50 group-hover:text-primary/70 transition-colors">{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-foreground font-display tracking-tight">{value}</div>
    </div>
  );
}
