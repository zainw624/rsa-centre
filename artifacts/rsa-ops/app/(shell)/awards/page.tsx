import { getAwardsBySeason } from '@/lib/db';

export const dynamic = 'force-dynamic';
export default async function AwardsPage() {
  const seasons = await getAwardsBySeason();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Awards Centre</p>
        <h1 className="text-2xl font-semibold text-white">Season awards and winners</h1>
      </header>

      {seasons.length === 0 ? (
        <div className="card rounded-3xl border border-rsa-border p-6 text-slate-400">No awards have been recorded yet.</div>
      ) : (
        <div className="space-y-6">
          {seasons.map((season: any) => (
            <section key={season.id} className="card rounded-3xl border border-rsa-border p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-widest text-rsa-gold">Season</p>
                  <h2 className="text-xl font-semibold text-white">{season.name}{season.current ? ' · Current' : ''}</h2>
                </div>
                <div className="text-sm text-slate-400">{season.awards.length} award entries</div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {season.awards.length === 0 ? (
                  <p className="text-slate-500">No awards recorded for this season.</p>
                ) : (
                  season.awards.map((award: any) => (
                    <div key={award.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="font-semibold text-white">{award.name}</div>
                      <div className="mt-2 text-slate-300">{award.description || award.achievement || 'Award winner'}</div>
                      <div className="mt-3 text-sm text-slate-400">Recipient: {award.recipientId || award.team?.teamName || 'Unassigned'}</div>
                      <div className="text-xs text-slate-500">Awarded: {award.awardedAt ? new Date(award.awardedAt).toLocaleDateString() : 'Unknown'}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
