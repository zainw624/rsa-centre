import { useEffect, useState } from 'react';
import StatCard from '../components/widgets/StatCard';

export default function ArchivesPage() {
  const [archive, setArchive] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/archives').then(r => r.json()).then(setArchive).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Season Archives</p>
        <h1 className="text-2xl font-semibold text-white">Historic fixtures, results, transfers and awards</h1>
      </header>
      {loading ? <div className="text-slate-400">Loading…</div> : !archive ? <div className="text-slate-400">No archive data.</div> : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Seasons" value={(archive.seasons ?? []).length} />
            <StatCard title="Fixtures" value={(archive.fixtures ?? []).length} />
            <StatCard title="Results" value={(archive.results ?? []).length} />
            <StatCard title="Transfers" value={(archive.transfers ?? []).length} />
            <StatCard title="Competitions" value={(archive.competitions ?? []).length} />
            <StatCard title="Awards" value={(archive.awards ?? []).length} />
          </section>
          <section className="card rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">Season archive overview</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              {(archive.seasons ?? []).length === 0 ? (
                <p className="text-slate-500">No season archive data available.</p>
              ) : (archive.seasons ?? []).map((season: any) => (
                <div key={season.id} className="rounded-3xl p-4" style={{ border: '1px solid #1e293b', background: 'rgba(15,23,42,0.8)' }}>
                  <div className="font-semibold text-white">{season.name}{season.current ? ' · Current' : ''}</div>
                  <div className="mt-2 text-slate-400">Competitions: {(season.competitions ?? []).length}</div>
                  <div className="text-slate-400">Awards: {(season.awards ?? []).length}</div>
                  <div className="text-slate-400">League entries: {(season.leagueTableEntries ?? []).length}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
