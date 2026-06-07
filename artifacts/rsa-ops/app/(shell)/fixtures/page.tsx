import { getUpcomingFixtures } from '@/lib/db';
import Image from 'next/image';

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
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Fixtures</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Upcoming Fixtures</h1>
        <p className="mt-1 text-sm text-slate-500">Scheduled matches for the current season</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view fixtures</p>
        </div>
      ) : upcoming.length === 0 ? (
        <div className="rounded-2xl border border-rsa-border bg-white/3 px-5 py-12 text-center">
          <p className="text-sm text-slate-400">No upcoming fixtures scheduled</p>
          <p className="mt-1 text-xs text-slate-600">Add fixtures through the admin panel or Discord bot</p>
        </div>
      ) : (
        <section className="grid gap-3">
          {upcoming.map((f: any) => (
            <div key={f.id} className="rounded-2xl border border-rsa-border bg-white/3 px-5 py-4 transition hover:border-rsa-gold/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-slate-900">
                      <Image
                        src={`/assets/${(f.homeTeamCode || f.homeTeam || '').toLowerCase()}.png`}
                        alt={f.homeTeam}
                        fill sizes="36px"
                        className="object-contain"
                        onError={() => {}}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white">{f.homeTeam}</span>
                  </div>

                  <span className="text-xs font-bold text-slate-600">VS</span>

                  <div className="flex items-center gap-2.5">
                    <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-slate-900">
                      <Image
                        src={`/assets/${(f.awayTeamCode || f.awayTeam || '').toLowerCase()}.png`}
                        alt={f.awayTeam}
                        fill sizes="36px"
                        className="object-contain"
                        onError={() => {}}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white">{f.awayTeam}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm text-slate-300">
                    {new Date(f.kickoff).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(f.kickoff).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {f.notes && <p className="mt-3 text-xs text-slate-500">{f.notes}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
