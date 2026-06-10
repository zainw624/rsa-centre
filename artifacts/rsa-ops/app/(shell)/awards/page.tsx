import { getAwardsBySeason } from '@/lib/db';
import { BrandHeader } from '@/components/BrandHeader';
import { Trophy, Medal, Star } from 'lucide-react';

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
    <div className="space-y-6">
      <BrandHeader
        title="Season Awards & Winners"
        subtitle="Recognised achievements across all RSA seasons"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view awards</p>
        </div>
      ) : seasons.length === 0 ? (
        <div className="card-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground font-display">No awards have been recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground font-medium">Awards will appear here once distributed</p>
        </div>
      ) : (
        <div className="space-y-10">
          {seasons.map((season: any) => (
            <section key={season.id}>
              <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-2">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-primary fill-primary/20" />
                  <h2 className="text-xl font-bold text-foreground font-display tracking-tight flex items-center gap-2">
                    {season.name}
                    {season.current && <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full ml-2">Current</span>}
                  </h2>
                </div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">
                  {season.awards.length} awards
                </span>
              </div>
              
              {season.awards.length === 0 ? (
                <div className="card-panel p-8 text-center border-dashed border-border bg-background/50">
                  <p className="text-sm font-medium text-muted-foreground">No awards recorded for this season.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {season.awards.map((award: any) => (
                    <div key={award.id} className="card-panel p-6 flex flex-col hover:border-primary/40 transition-colors group">
                      <div className="mb-4 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Medal className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base text-foreground font-display mb-1">{award.name}</h3>
                      <p className="text-xs font-medium text-muted-foreground mb-4 flex-1">{award.description || award.achievement || 'Award winner'}</p>
                      
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary">Recipient</span>
                          <span className="font-bold text-sm text-foreground truncate">{award.recipientId || award.team?.teamName || 'Unassigned'}</span>
                        </div>
                        <div className="mt-3 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                          <span>Awarded</span>
                          <span>{award.awardedAt ? new Date(award.awardedAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
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
