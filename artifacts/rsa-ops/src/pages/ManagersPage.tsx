import { useEffect, useState } from 'react';

function ManagerCard({ assignment }: { assignment: any }) {
  const user = assignment.user;
  const team = assignment.team;
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
          <div className="text-xs text-slate-300">{assignment.role}</div>
        </div>
        <div className="mt-2 text-sm text-slate-300">Team: {team?.teamName}</div>
      </div>
    </div>
  );
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/managers').then(r => r.json()).then(setManagers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Managers</p>
        <h1 className="text-2xl font-semibold text-white">Team managers & assistants</h1>
      </header>
      {loading ? <div className="text-slate-400">Loading…</div> : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {managers.map((a: any, idx: number) => (
            <ManagerCard key={`${a.user?.id}-${a.team?.id}-${idx}`} assignment={a} />
          ))}
        </section>
      )}
    </div>
  );
}
