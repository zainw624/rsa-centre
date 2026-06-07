import { useEffect, useState } from 'react';

function StaffCard({ user, role }: { user: any; role: string }) {
  return (
    <div className="card flex items-center gap-4 rounded-2xl p-4">
      <div className="relative h-12 w-12 overflow-hidden rounded-full">
        <img src={user?.image || '/assets/rsa1.png'} alt={user?.name ?? user?.discordId} className="object-cover w-full h-full" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">{user?.name ?? user?.discordId}</div>
            <div className="text-xs text-slate-400">@{user?.discordId}</div>
          </div>
          <div className="text-xs text-slate-300">{role}</div>
        </div>
        <div className="mt-2 text-sm text-slate-300">Status: Active</div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const [groups, setGroups] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/staff').then(r => r.json()).then(setGroups).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Staff Centre</p>
        <h1 className="text-2xl font-semibold text-white">RSA Staff Directory</h1>
      </header>
      {loading ? <div className="text-slate-400">Loading…</div> : (
        <div className="space-y-8">
          {Object.entries(groups).map(([dept, members]) => (
            <div key={dept}>
              <h2 className="mb-4 text-lg font-semibold text-white">{dept}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(members as any[]).map((item, i) => <StaffCard key={i} user={item.user} role={item.role} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
