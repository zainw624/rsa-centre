import { getAwardsBySeason } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AwardsPage() {
  let seasons: any[] = [];
  let dbError = false;

  try {
    seasons = await getAwardsBySeason();
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Awards Centre</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Season Awards &amp; Winners</h1>
        <p className="mt-1 text-sm text-slate-500">Recognised achievements across all RSA seasons</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view awards</p>
        </div>
      ) : seasons.length === 0 ? (
        <div className="rounded-2xl border border-rsa-border bg-white/3 px-5 py-12 text-center">
          <p className="text-sm text-slate-400">No awards have been recorded yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {seasons.map((season: any) => (
            <section key={season.id} className="rounded-2xl border border-rsa-border bg-white/3 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Season</p>
                  <h2 className="text-lg font-semibold text-white">{season.name}{season.current ? ' · Current' : ''}</h2>
                </div>
                <span className="text-xs text-slate-500">{season.awards.length} awards</span>
              </div>
              {season.awards.length === 0 ? (
                <p className="text-sm text-slate-500">No awards recorded for this season.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {season.awards.map((award: any) => (
                    <div key={award.id} className="rounded-xl border border-rsa-border bg-black/20 p-4">
                      <p className="font-semibold text-white">{award.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{award.description || award.achievement || 'Award winner'}</p>
                      <div className="mt-3 space-y-1 text-xs text-slate-500">
                        <p>Recipient: {award.recipientId || award.team?.teamName || 'Unassigned'}</p>
                        <p>Awarded: {award.awardedAt ? new Date(award.awardedAt).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
