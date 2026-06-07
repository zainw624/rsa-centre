import { getHallOfFameEntries } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HallOfFamePage() {
  let seasons: any[] = [];
  let dbError = false;

  try {
    seasons = await getHallOfFameEntries();
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Hall of Fame</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Legendary Winners &amp; Historic Achievements</h1>
        <p className="mt-1 text-sm text-slate-500">The permanent record of RSA&apos;s greatest players, teams, and moments</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view the Hall of Fame</p>
        </div>
      ) : seasons.length === 0 ? (
        <div className="rounded-2xl border border-rsa-border bg-white/3 px-5 py-12 text-center">
          <p className="text-sm text-slate-400">No Hall of Fame entries have been recorded yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {seasons.map((season: any) => (
            <section key={season.id} className="rounded-2xl border border-rsa-border bg-white/3 p-5">
              <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Season</p>
                  <h2 className="text-lg font-semibold text-white">{season.name}{season.current ? ' · Current' : ''}</h2>
                </div>
                <p className="text-xs text-slate-500">
                  {season.hallOfFameEntries.length} honour entries · {season.awards.length} awards
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-bold text-white">Hall of Fame Entries</h3>
                  {season.hallOfFameEntries.length === 0 ? (
                    <p className="text-sm text-slate-500">No entries for this season.</p>
                  ) : (
                    <div className="space-y-2">
                      {season.hallOfFameEntries.map((entry: any) => (
                        <div key={entry.id} className="rounded-xl border border-rsa-border bg-black/20 p-4">
                          <p className="font-semibold text-white">{entry.playerTag}</p>
                          <p className="text-sm text-slate-400">{entry.achievement}</p>
                          <p className="mt-1 text-xs text-slate-500">Year: {entry.year}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-bold text-white">Season Awards</h3>
                  {season.awards.length === 0 ? (
                    <p className="text-sm text-slate-500">No awards for this season.</p>
                  ) : (
                    <div className="space-y-2">
                      {season.awards.map((award: any) => (
                        <div key={award.id} className="rounded-xl border border-rsa-border bg-black/20 p-4">
                          <p className="font-semibold text-white">{award.name}</p>
                          <p className="text-sm text-slate-400">{award.recipientId || award.team?.teamName || award.achievement || 'Winner'}</p>
                          <p className="mt-1 text-xs text-slate-500">{award.awardedAt ? new Date(award.awardedAt).toLocaleDateString() : 'Unknown date'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
