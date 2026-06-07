import { useEffect, useState } from 'react';

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/fixtures').then(r => r.json()).then(setFixtures).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Fixtures</p>
        <h1 className="text-2xl font-semibold text-white">Upcoming fixtures</h1>
      </header>
      {loading ? <div className="text-slate-400">Loading…</div> : (
        <section className="grid gap-4">
          {fixtures.length === 0 ? <div className="text-slate-400">No upcoming fixtures.</div> : fixtures.map((f: any) => (
            <div key={f.id} className="card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <img src={`/assets/${(f.homeTeamCode || f.homeTeam).toLowerCase()}.png`} alt={f.homeTeam} className="object-contain w-full h-full" onError={e => { (e.target as HTMLImageElement).src = '/assets/rsa1.png'; }} />
                    </div>
                    <div className="text-white">{f.homeTeam}</div>
                  </div>
                  <div className="text-sm text-slate-400">vs</div>
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <img src={`/assets/${(f.awayTeamCode || f.awayTeam).toLowerCase()}.png`} alt={f.awayTeam} className="object-contain w-full h-full" onError={e => { (e.target as HTMLImageElement).src = '/assets/rsa1.png'; }} />
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
      )}
    </div>
  );
}
