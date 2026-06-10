export function RoleBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground shadow-sm">
      {name}
    </span>
  );
}
