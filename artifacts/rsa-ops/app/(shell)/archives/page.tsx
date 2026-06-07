import { getArchiveData } from '@/lib/db';
import StatCard from '@/components/widgets/StatCard';

export const dynamic = 'force-dynamic';

const EMPTY_ARCHIVE = {
  seasons: [], fixtures: [], results: [],
  transfers: [], competitions: [], awards: [],
};

export default async function ArchivesPage() {
  let archive: any = EMPTY_ARCHIVE;
  let dbError = false;

  try {
    archive = await getArchiveData();
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Season Archives</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Historical Archive</h1>
        <p className="mt-1 text-sm text-slate-500">Past fixtures, results, transfers, competitions and awards</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view archive data</p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Seasons"      value={archive.seasons.length} />
            <StatCard title="Fixtures"     value={archive.fixtures.length} />
            <StatCard title="Results"      value={archive.results.length} />
            <StatCard title="Transfers"    value={archive.transfers.length} />
            <StatCard title="Competitions" value={archive.competitions.length} />
            <StatCard title="Awards"       value={archive.awards.length} />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
                <h2 className="text-base font-semibold text-white">Season Overview</h2>
                <div className="mt-4 space-y-2">
                  {archive.seasons.length === 0 ? (
                    <p className="text-sm text-slate-500">No season archive data available.</p>
                  ) : archive.seasons.map((season: any) => (
                    <div key={season.id} className="rounded-xl border border-rsa-border bg-black/20 p-4">
                      <p className="font-semibold text-white">{season.name}{season.current ? ' · Current' : ''}</p>
                      <div className="mt-1 text-xs text-slate-500 space-x-3">
                        <span>Competitions: {season.competitions.length}</span>
                        <span>Awards: {season.awards.length}</span>
                        <span>Table entries: {season.leagueTableEntries.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
                <h2 className="text-base font-semibold text-white">Historic Competitions</h2>
                <div className="mt-4 space-y-2">
                  {archive.competitions.length === 0 ? (
                    <p className="text-sm text-slate-500">No competition data available.</p>
                  ) : archive.competitions.map((c: any) => (
                    <div key={c.id} className="rounded-xl border border-rsa-border bg-black/20 p-4">
                      <p className="font-semibold text-white">{c.name}</p>
                      <p className="text-sm text-slate-400">{c.description || 'No description available'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
                <h2 className="text-base font-semibold text-white">Latest Archived Results</h2>
                <div className="mt-4 space-y-2">
                  {archive.results.length === 0 ? (
                    <p className="text-sm text-slate-500">No archived results available.</p>
                  ) : archive.results.slice(0, 10).map((result: any) => (
                    <div key={result.id} className="rounded-xl border border-rsa-border bg-black/20 px-4 py-3">
                      <p className="text-sm font-medium text-white">{result.homeTeam} {result.homeScore} – {result.awayScore} {result.awayTeam}</p>
                      <p className="text-xs text-slate-500">{new Date(result.matchDate).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-rsa-border bg-white/3 p-5">
                <h2 className="text-base font-semibold text-white">Archived Fixtures</h2>
                <div className="mt-4 space-y-2">
                  {archive.fixtures.length === 0 ? (
                    <p className="text-sm text-slate-500">No archived fixtures available.</p>
                  ) : archive.fixtures.slice(0, 10).map((fixture: any) => (
                    <div key={fixture.id} className="rounded-xl border border-rsa-border bg-black/20 px-4 py-3">
                      <p className="text-sm font-medium text-white">{fixture.homeTeam} vs {fixture.awayTeam}</p>
                      <p className="text-xs text-slate-500">{new Date(fixture.kickoff).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
