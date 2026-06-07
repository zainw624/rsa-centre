import { getUpcomingFixtures } from '@/lib/db';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export default async function FixturesPage() {
  const upcoming = await getUpcomingFixtures(50);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Fixtures</p>
        <h1 className="text-2xl font-semibold text-white">Upcoming fixtures</h1>
      </header>

      <section className="grid gap-4">
        {upcoming.map((f: any) => (
          <div key={f.id} className="card rounded-2xl border border-rsa-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md">
                    <Image src={`/assets/${(f.homeTeamCode||f.homeTeam).toLowerCase()}.png`} alt={f.homeTeam} fill sizes="40px" className="object-contain" />
                  </div>
                  <div className="text-white">{f.homeTeam}</div>
                </div>

                <div className="text-sm text-slate-400">vs</div>

                <div className="flex items-center gap-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md">
                    <Image src={`/assets/${(f.awayTeamCode||f.awayTeam).toLowerCase()}.png`} alt={f.awayTeam} fill sizes="40px" className="object-contain" />
                  </div>
                  <div className="text-white">{f.awayTeam}</div>
                </div>
              </div>

              <div className="text-sm text-slate-400">
                <div>{new Date(f.kickoff).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                <div className="mt-1">{new Date(f.kickoff).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            {f.notes && <p className="mt-3 text-sm text-slate-300">Notes: {f.notes}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
