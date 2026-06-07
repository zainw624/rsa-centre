import { useEffect, useState } from 'react';
import { Link } from 'wouter';

function logoPath(team: any) {
  if (team.logo) return team.logo;
  const code = (team.teamCode || team.teamName || 'usa').toString().toLowerCase();
  return `/assets/${code}.png`;
}

function TeamCard({ team }: { team: any }) {
  const manager = team.managerAssignments?.find((m: any) => m.role === 'manager')?.user;
  const assistant = team.managerAssignments?.find((m: any) => m.role === 'assistant')?.user;
  const rosterSize = team.rosterPlayers?.length ?? 0;
  const status = rosterSize >= team.rosterLimit ? 'Roster Full' : rosterSize === 0 ? 'Needs Players' : manager ? (assistant ? 'Fully Staffed' : 'Assistant Needed') : 'Vacant Team';

  return (
    <Link href={`/teams/${(team.teamCode || team.teamName).toString().toLowerCase()}`} className="card block rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-rsa-gold transition hover:border-rsa-gold/50">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
          <img src={logoPath(team)} alt={team.teamName} className="object-contain w-full h-full" onError={e => { (e.target as HTMLImageElement).src = '/assets/rsa1.png'; }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{team.teamName}</h3>
            <div className="text-xs text-slate-400">{status}</div>
          </div>
          <div className="mt-2 text-sm text-slate-300">Manager: {manager ? (manager.name ?? manager.discordId) : '—'}</div>
          <div className="text-sm text-slate-300">Assistant: {assistant ? (assistant.name ?? assistant.discordId) : '—'}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
        <div>Roster: <span className="text-white">{rosterSize}/{team.rosterLimit}</span></div>
        <div>{team.results?.length ?? 0} recent results</div>
      </div>
    </Link>
  );
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teams').then(r => r.json()).then(setTeams).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Teams</p>
          <h1 className="text-2xl font-semibold text-white">All national teams</h1>
        </div>
      </header>
      {loading ? <div className="text-slate-400">Loading…</div> : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team: any) => <TeamCard key={team.id} team={team} />)}
        </section>
      )}
    </div>
  );
}
