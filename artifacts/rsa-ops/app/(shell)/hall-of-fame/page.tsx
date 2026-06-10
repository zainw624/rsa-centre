import { getHallOfFameEntries } from '@/lib/db';
import { BrandHeader } from '@/components/BrandHeader';
import { Trophy, Star, Crown } from 'lucide-react';

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
    <div className="space-y-6">
      <BrandHeader
        title="Hall of Fame"
        subtitle="The permanent record of RSA's greatest players, teams, and moments"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view the Hall of Fame</p>
        </div>
      ) : seasons.length === 0 ? (
        <div className="card-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground font-display">No Hall of Fame entries</p>
          <p className="mt-1 text-sm text-muted-foreground font-medium">Legends will be immortalised here</p>
        </div>
      ) : (
        <div className="space-y-10">
          {seasons.map((season: any) => (
            <section key={season.id}>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 border-b border-border/50 pb-2 gap-2">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-primary fill-primary/20" />
                  <h2 className="text-xl font-bold text-foreground font-display tracking-tight flex items-center gap-2">
                    {season.name}
                    {season.current && <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full ml-2">Current</span>}
                  </h2>
                </div>
                <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex gap-2">
                  <span className="bg-muted border border-border px-2 py-0.5 rounded">{season.hallOfFameEntries.length} honours</span>
                  <span className="bg-muted border border-border px-2 py-0.5 rounded">{season.awards.length} awards</span>
                </div>
              </div>
              
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Hall of Fame Entries */}
                <div className="card-panel p-6 border-primary/20 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] text-primary">
                    <Crown className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-2 mb-6 relative z-10">
                    <Crown className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-foreground font-display">Inductees</h3>
                  </div>
                  
                  {season.hallOfFameEntries.length === 0 ? (
                    <div className="py-6 text-center text-sm font-medium text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border relative z-10">
                      No entries for this season.
                    </div>
                  ) : (
                    <div className="space-y-3 relative z-10">
                      {season.hallOfFameEntries.map((entry: any) => (
                        <div key={entry.id} className="p-4 rounded-xl bg-background border border-border/80 shadow-sm flex flex-col justify-center">
                          <p className="font-bold text-lg text-foreground font-display mb-1 text-primary">{entry.playerTag}</p>
                          <p className="text-sm font-medium text-muted-foreground leading-relaxed">{entry.achievement}</p>
                          <div className="mt-3 flex justify-between items-center text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Inducted</span>
                            <span>{entry.year}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Season Awards */}
                <div className="card-panel p-6 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] text-foreground">
                    <Trophy className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-2 mb-6 relative z-10">
                    <Trophy className="w-5 h-5 text-foreground" />
                    <h3 className="text-base font-bold text-foreground font-display">Season Awards</h3>
                  </div>
                  
                  {season.awards.length === 0 ? (
                    <div className="py-6 text-center text-sm font-medium text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border relative z-10">
                      No awards for this season.
                    </div>
                  ) : (
                    <div className="space-y-3 relative z-10">
                      {season.awards.map((award: any) => (
                        <div key={award.id} className="p-4 rounded-xl bg-background border border-border/80 shadow-sm">
                          <p className="font-bold text-sm text-foreground mb-0.5">{award.name}</p>
                          <p className="text-sm font-medium text-muted-foreground mb-3">{award.recipientId || award.team?.teamName || award.achievement || 'Winner'}</p>
                          <div className="flex justify-between items-center text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground pt-3 border-t border-border/50">
                            <span>Awarded</span>
                            <span>{award.awardedAt ? new Date(award.awardedAt).toLocaleDateString() : 'Unknown date'}</span>
                          </div>
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
