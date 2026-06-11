import { getArchiveData } from '@/lib/db';
import StatCard from '@/components/widgets/StatCard';
import { BrandHeader } from '@/components/BrandHeader';
import { Trophy, CalendarDays, Archive, FileBarChart2 } from 'lucide-react';

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
    <div className="space-y-6">
      <BrandHeader
        title="Historical Archive"
        subtitle="Past seasons, fixtures, results, transfers and achievements"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view archive data</p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard title="Seasons"      value={archive.seasons.length} icon={<Archive className="w-5 h-5"/>} />
            <StatCard title="Fixtures"     value={archive.fixtures.length} icon={<CalendarDays className="w-5 h-5"/>} />
            <StatCard title="Results"      value={archive.results.length} icon={<FileBarChart2 className="w-5 h-5"/>} />
            <StatCard title="Transfers"    value={archive.transfers.length} />
            <StatCard title="Competitions" value={archive.competitions.length} icon={<Trophy className="w-5 h-5"/>} />
            <StatCard title="Awards"       value={archive.awards.length} />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="card-panel p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-2">
                  <Archive className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground font-display">Season Overview</h2>
                </div>
                <div className="space-y-3">
                  {archive.seasons.length === 0 ? (
                    <div className="py-6 text-center text-sm font-medium text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border">No season archive data available.</div>
                  ) : archive.seasons.map((season: any) => (
                    <div key={season.id} className="p-4 rounded-xl bg-background border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-foreground text-sm flex items-center gap-2">
                          {season.name}
                          {season.current && <span className="text-[0.65rem] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">Current</span>}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                          <span>{season.competitions.length} competitions</span>
                          <span>&bull;</span>
                          <span>{season.awards.length} awards</span>
                          <span>&bull;</span>
                          <span>{season.leagueTableEntries.length} rankings</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-panel p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground font-display">Historic Competitions</h2>
                </div>
                <div className="space-y-3">
                  {archive.competitions.length === 0 ? (
                    <div className="py-6 text-center text-sm font-medium text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border">No competition data available.</div>
                  ) : archive.competitions.map((c: any) => (
                    <div key={c.id} className="p-4 rounded-xl bg-background border border-border shadow-sm">
                      <p className="font-bold text-foreground text-sm">{c.name}</p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground leading-relaxed">{c.description || 'No description available'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-panel p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-2">
                  <FileBarChart2 className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground font-display">Latest Archived Results</h2>
                </div>
                <div className="space-y-3">
                  {archive.results.length === 0 ? (
                    <div className="py-6 text-center text-sm font-medium text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border">No archived results available.</div>
                  ) : archive.results.slice(0, 10).map((result: any) => (
                    <div key={result.id} className="p-4 rounded-xl bg-background border border-border shadow-sm flex items-center justify-between">
                      <div className="flex-1 flex items-center gap-2 sm:gap-4">
                        <span className="font-bold text-sm text-foreground text-right flex-1 truncate">{result.homeTeam}</span>
                        <span className="text-xs font-bold font-mono bg-muted border border-border px-2 py-0.5 rounded shrink-0">{result.homeScore} - {result.awayScore}</span>
                        <span className="font-bold text-sm text-foreground text-left flex-1 truncate">{result.awayTeam}</span>
                      </div>
                      <span className="hidden sm:block ml-4 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground shrink-0">{new Date(result.matchDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-panel p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground font-display">Archived Fixtures</h2>
                </div>
                <div className="space-y-3">
                  {archive.fixtures.length === 0 ? (
                    <div className="py-6 text-center text-sm font-medium text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border">No archived fixtures available.</div>
                  ) : archive.fixtures.slice(0, 10).map((fixture: any) => (
                    <div key={fixture.id} className="p-4 rounded-xl bg-background border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <span className="truncate max-w-[120px]">{fixture.homeTeam}</span>
                        <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mx-1">vs</span>
                        <span className="truncate max-w-[120px]">{fixture.awayTeam}</span>
                      </div>
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground shrink-0">{new Date(fixture.kickoff).toLocaleDateString()}</span>
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
