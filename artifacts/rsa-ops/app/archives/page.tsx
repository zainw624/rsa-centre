import { getArchiveData } from '@/lib/db';
import StatCard from '@/components/widgets/StatCard';

export const dynamic = 'force-dynamic';
export default async function ArchivesPage() {
  const archive = await getArchiveData();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Season Archives</p>
        <h1 className="text-2xl font-semibold text-white">Historic fixtures, results, transfers and awards</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Seasons" value={archive.seasons.length} />
        <StatCard title="Fixtures" value={archive.fixtures.length} />
        <StatCard title="Results" value={archive.results.length} />
        <StatCard title="Transfers" value={archive.transfers.length} />
        <StatCard title="Competitions" value={archive.competitions.length} />
        <StatCard title="Awards" value={archive.awards.length} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="card rounded-3xl border border-rsa-border p-6">
            <h2 className="text-xl font-semibold text-white">Season archive overview</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              {archive.seasons.length === 0 ? (
                <p className="text-slate-500">No season archive data available.</p>
              ) : (
                archive.seasons.map((season: any) => (
                  <div key={season.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="font-semibold text-white">{season.name}{season.current ? ' · Current' : ''}</div>
                    <div className="mt-2 text-slate-400">Competitions: {season.competitions.length}</div>
                    <div className="text-slate-400">Awards: {season.awards.length}</div>
                    <div className="text-slate-400">League entries: {season.leagueTableEntries.length}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card rounded-3xl border border-rsa-border p-6">
            <h2 className="text-xl font-semibold text-white">Historic competitions</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {archive.competitions.length === 0 ? (
                <p className="text-slate-500">No competition data available.</p>
              ) : (
                archive.competitions.map((competition: any) => (
                  <div key={competition.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="font-semibold text-white">{competition.name}</div>
                    <div className="mt-1 text-slate-400">{competition.description || 'No description available'}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card rounded-3xl border border-rsa-border p-6">
            <h2 className="text-xl font-semibold text-white">Latest archived results</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {archive.results.slice(0, 10).map((result: any) => (
                <div key={result.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <div>{result.homeTeam} {result.homeScore} - {result.awayScore} {result.awayTeam}</div>
                  <div className="text-xs text-slate-500">{new Date(result.matchDate).toLocaleDateString()}</div>
                </div>
              ))}
              {archive.results.length === 0 && <p className="text-slate-500">No archived results available.</p>}
            </div>
          </section>

          <section className="card rounded-3xl border border-rsa-border p-6">
            <h2 className="text-xl font-semibold text-white">Recent archived fixtures</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {archive.fixtures.slice(0, 10).map((fixture: any) => (
                <div key={fixture.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <div>{fixture.homeTeam} vs {fixture.awayTeam}</div>
                  <div className="text-xs text-slate-500">{new Date(fixture.kickoff).toLocaleDateString()}</div>
                </div>
              ))}
              {archive.fixtures.length === 0 && <p className="text-slate-500">No archived fixtures available.</p>}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
