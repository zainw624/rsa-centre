export default function ActivityCard({ items }: { items: Array<{ id: string; text: string; createdAt?: string }> }) {
  return (
    <div className="card rounded-2xl p-4">
      <p className="text-xs uppercase tracking-widest text-rsa-gold">Recent Activity</p>
      <ul className="mt-3 space-y-3">
        {items.length === 0 ? <li className="text-sm text-slate-400">No recent activity.</li> : items.map((it) => (
          <li key={it.id} className="flex items-start justify-between">
            <div className="text-sm text-slate-200">{it.text}</div>
            <div className="ml-4 shrink-0 text-xs text-slate-400">{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
