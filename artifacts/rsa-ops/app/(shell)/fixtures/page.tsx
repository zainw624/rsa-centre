import { getUpcomingFixtures } from '@/lib/db';
import Image from 'next/image';
import { BrandHeader } from '@/components/BrandHeader';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FixturesPage() {
  let upcoming: any[] = [];
  let dbError = false;

  try {
    upcoming = await getUpcomingFixtures(50);
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <BrandHeader
        title="Upcoming Fixtures"
        subtitle="Scheduled matches across all active competitions"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view fixtures</p>
        </div>
      ) : upcoming.length === 0 ? (
        <div className="card-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground font-display">No fixtures scheduled</p>
          <p className="mt-1 text-sm text-muted-foreground font-medium">Fixtures can be added via the Discord bot or admin panel</p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((f: any) => (
            <div key={f.id} className="card-panel p-5 group flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  {f.competition || 'League Match'}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    {new Date(f.kickoff).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">
                    {new Date(f.kickoff).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4 mt-auto py-2">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative w-12 h-12 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center p-1.5">
                    <Image src={`/assets/${(f.homeTeamCode || f.homeTeam || '').toLowerCase()}.png`} alt={f.homeTeam} fill sizes="48px" className="object-contain" />
                  </div>
                  <span className="text-sm font-bold text-foreground text-center line-clamp-2 leading-tight">{f.homeTeam}</span>
                </div>
                
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">VS</span>
                
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative w-12 h-12 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center p-1.5">
                    <Image src={`/assets/${(f.awayTeamCode || f.awayTeam || '').toLowerCase()}.png`} alt={f.awayTeam} fill sizes="48px" className="object-contain" />
                  </div>
                  <span className="text-sm font-bold text-foreground text-center line-clamp-2 leading-tight">{f.awayTeam}</span>
                </div>
              </div>

              {f.notes && (
                <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground font-medium">
                  {f.notes}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
