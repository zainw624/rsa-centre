import { getActiveSanctions, getCupTiedPlayers } from '@/lib/db';

export const dynamic = 'force-dynamic';
export default async function DisciplinePage() {
  const sanctions = await getActiveSanctions(50);
  const cupTied = await getCupTiedPlayers();

  const totalSanctions = sanctions.length;
  const cupTiedCount = cupTied.length;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Discipline</p>
        <h1 className="text-2xl font-semibold text-white">Sanctions & eligibility</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="card rounded-2xl border border-rsa-border p-4">
            <h2 className="text-white">Sanctioned Players ({totalSanctions})</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {sanctions.map((s: any) => (
                <li key={s.id}>{s.playerTag} — {s.sanctionType} — {s.reason}</li>
              ))}
            </ul>
          </section>

          <section className="mt-4 card rounded-2xl border border-rsa-border p-4">
            <h2 className="text-white">Sanction History</h2>
            <p className="mt-2 text-sm text-slate-400">View recent sanctions and their status.</p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card rounded-2xl border border-rsa-border p-4">
            <p className="text-sm text-slate-400">Cup Tied Players</p>
            <div className="mt-2 text-lg font-semibold text-white">{cupTiedCount}</div>
          </div>

          <div className="card rounded-2xl border border-rsa-border p-4">
            <p className="text-sm text-slate-400">Eligibility rules</p>
            <p className="mt-2 text-sm text-slate-300">Players with the Cup Tied role (ID: 1512515140346445876) cannot be signed. Sanctioned players may be restricted based on staff decisions.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
