import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';

export default function TeamDetailPage() {
  const params = useParams<{ team: string }>();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${params.team}`).then(r => r.json()).then(setTeam).catch(() => {}).finally(() => setLoading(false));
  }, [params.team]);

  if (loading) return <div className="text-slate-400">Loading…</div>;
  if (!team) return <div className="text-white">Team not found.</div>;

  const manager = team.managerAssignments?.find((m: any) => m.role === 'manager')?.user;
  const assistant = team.managerAssignments?.find((m: any) => m.role === 'assistant')?.user;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Link href="/teams" className="text-sm text-rsa-gold hover:underline">← Back to Teams</Link>

      <div className="card rounded-3xl p-6 flex items-center gap-6">
        <img src={`/assets/${(team.teamCode || team.teamName || 'rsa1').toLowerCase()}.png`} alt={team.teamName} className="h-20 w-20 object-contain" onError={e => { (e.target as HTMLImageElement).src = '/assets/rsa1.png'; }} />
        <div>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Team</p>
          <h1 className="text-3xl font-semibold text-white">{team.teamName}</h1>
          <div className="mt-2 text-sm text-slate-400">Roster: {team.rosterPlayers?.length}/{team.rosterLimit}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card rounded-3xl p-6">
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Management</p>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div>Manager: <span className="text-white">{manager ? (manager.name ?? manager.discordId) : '—'}</span></div>
            <div>Assistant: <span className="text-white">{assistant ? (assistant.name ?? assistant.discordId) : '—'}</span></div>
          </div>
        </div>
        <div className="card rounded-3xl p-6">
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Roster ({team.rosterPlayers?.length ?? 0})</p>
          <ul className="mt-4 space-y-1 text-sm text-slate-300">
            {(team.rosterPlayers ?? []).map((r: any) => (
              <li key={r.id}>{r.playerTag}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
