import { getActiveSanctions, getCupTiedPlayers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DisciplinePage() {
  let sanctions: any[] = [];
  let cupTied: any[]   = [];
  let dbError = false;

  try {
    [sanctions, cupTied] = await Promise.all([getActiveSanctions(50), getCupTiedPlayers()]);
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Discipline</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Sanctions &amp; Eligibility</h1>
        <p className="mt-1 text-sm text-slate-500">Active bans, restrictions, and cup-tied player status</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view discipline data</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
              <h2 className="text-sm font-bold text-white">
                Sanctioned Players
                <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">{sanctions.length}</span>
              </h2>
              {sanctions.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No active sanctions</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {sanctions.map((s: any) => (
                    <li key={s.id} className="flex items-start justify-between gap-4 rounded-xl border border-rsa-border bg-black/20 px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-white">{s.playerTag}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.reason}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                        {s.sanctionType}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
              <h2 className="text-sm font-bold text-white">Sanction History</h2>
              <p className="mt-3 text-sm text-slate-500">Historical sanctions are managed through the Discord bot and reflected here on next sync.</p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Cup-Tied Players</p>
              <p className="mt-3 text-3xl font-bold text-white">{cupTied.length}</p>
              <p className="mt-1 text-xs text-slate-500">Cannot be signed during cup competitions</p>
            </div>

            <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Eligibility Rules</p>
              <p className="mt-3 text-sm text-slate-400">
                Cup-tied players cannot be signed. Sanctioned players may be restricted based on staff decisions.
                All decisions are enforced by the RSA bot and reflected here automatically.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
