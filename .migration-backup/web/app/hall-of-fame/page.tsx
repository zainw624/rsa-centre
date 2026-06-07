import { getHallOfFameEntries } from '@/lib/db';

export const dynamic = 'force-dynamic';
export default async function HallOfFamePage() {
  const seasons = await getHallOfFameEntries();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Hall of Fame</p>
        <h1 className="text-2xl font-semibold text-white">Legendary winners and historic achievements</h1>
      </header>

      {seasons.length === 0 ? (
        <div className="card rounded-3xl border border-rsa-border p-6 text-slate-400">No Hall of Fame entries have been recorded yet.</div>
      ) : (
        <div className="space-y-6">
          {seasons.map((season: any) => (
            <section key={season.id} className="card rounded-3xl border border-rsa-border p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-widest text-rsa-gold">Season</p>
                  <h2 className="text-xl font-semibold text-white">{season.name}{season.current ? ' · Current' : ''}</h2>
                </div>
                <div className="text-sm text-slate-400">
                  {season.hallOfFameEntries.length} honour entries · {season.awards.length} awards · {season.competitions.length} competitions
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Hall of Fame entries</h3>
                  {season.hallOfFameEntries.length === 0 ? (
                    <p className="text-slate-500">No entries recorded for this season.</p>
                  ) : (
                    <div className="space-y-3">
                      {season.hallOfFameEntries.map((entry: any) => (
                        <div key={entry.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                          <div className="font-semibold text-white">{entry.playerTag}</div>
                          <div className="text-slate-400">{entry.achievement}</div>
                          <div className="mt-2 text-xs text-slate-500">Year: {entry.year}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Season awards</h3>
                  {season.awards.length === 0 ? (
                    <p className="text-slate-500">No awards recorded for this season.</p>
                  ) : (
                    <div className="space-y-3">
                      {season.awards.map((award: any) => (
                        <div key={award.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                          <div className="font-semibold text-white">{award.name}</div>
                          <div className="text-slate-400">{award.recipientId ? award.recipientId : award.team?.teamName || award.achievement || 'Winner'}</div>
                          <div className="mt-2 text-xs text-slate-500">Awarded at: {award.awardedAt ? new Date(award.awardedAt).toLocaleDateString() : 'Unknown'}</div>
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
