export function RoleBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-200 shadow-sm" style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(255,255,255,0.05)' }}>
      {name}
    </span>
  );
}
