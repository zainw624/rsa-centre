import { useEffect, useState } from 'react';

function RosterList({ team }: { team: any }) {
  return (
    <div className="card rounded-2xl p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-md">
          <img src={team.logo || `/assets/${(team.teamCode || team.teamName).toLowerCase()}.png`} alt={team.teamName} className="object-contain w-full h-full" onError={e => { (e.target as HTMLImageElement).src = '/assets/rsa1.png'; }} />
        </div>
        <div>
          <div className="text-sm text-slate-400">{team.teamName}</div>
          <div className="text-sm text-white">Roster: {team.rosterPlayers?.length}/{team.rosterLimit}</div>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {(team.rosterPlayers ?? []).map((r: any) => (
          <li key={r.id}>{r.playerTag} <span className="text-xs text-slate-500">({r.playerId})</span></li>
        ))}
      </ul>
    </div>
  );
}

export default function RostersPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teams').then(r => r.json()).then(setTeams).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Rosters</p>
        <h1 className="text-2xl font-semibold text-white">Team rosters</h1>
      </header>
      {loading ? <div className="text-slate-400">Loading…</div> : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team: any) => <RosterList key={team.id} team={team} />)}
        </section>
      )}
    </div>
  );
}
