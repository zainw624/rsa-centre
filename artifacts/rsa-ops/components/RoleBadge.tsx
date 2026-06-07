export function RoleBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex rounded-full border border-rsa-border bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-200 shadow-sm">
      {name}
    </span>
  );
}
