import React from 'react';

export default function StatCard({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="card rounded-2xl border border-rsa-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-rsa-gold">{title}</p>
          <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
        </div>
        {icon && <div className="text-2xl text-white/80">{icon}</div>}
      </div>
    </div>
  );
}
