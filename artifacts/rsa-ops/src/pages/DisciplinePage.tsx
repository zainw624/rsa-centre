import { useEffect, useState } from 'react';

export default function DisciplinePage() {
  const [sanctions, setSanctions] = useState<any[]>([]);
  const [cupTied, setCupTied] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/discipline').then(r => r.json()).then((d: any) => { setSanctions(d.sanctions ?? []); setCupTied(d.cupTied ?? []); }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Discipline</p>
        <h1 className="text-2xl font-semibold text-white">Sanctions & eligibility</h1>
      </header>
      {loading ? <div className="text-slate-400">Loading…</div> : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <section className="card rounded-2xl p-4">
              <h2 className="text-white">Sanctioned Players ({sanctions.length})</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {sanctions.length === 0 ? <li className="text-slate-500">No active sanctions.</li> : sanctions.map((s: any) => (
                  <li key={s.id}>{s.playerTag} — {s.sanctionType} — {s.reason}</li>
                ))}
              </ul>
            </section>
          </div>
          <aside className="space-y-4">
            <div className="card rounded-2xl p-4">
              <p className="text-sm text-slate-400">Cup Tied Players</p>
              <div className="mt-2 text-lg font-semibold text-white">{cupTied.length}</div>
            </div>
            <div className="card rounded-2xl p-4">
              <p className="text-sm text-slate-400">Eligibility rules</p>
              <p className="mt-2 text-sm text-slate-300">Players with the Cup Tied role cannot be signed. Sanctioned players may be restricted based on staff decisions.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
