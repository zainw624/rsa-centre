import Image from 'next/image';
import Link from 'next/link';

function logoPath(team: any) {
  if (team.logo) return team.logo;
  const code = (team.teamCode || team.teamName || 'usa').toString().toLowerCase();
  return `/assets/${code}.png`;
}

export default function TeamCard({ team }: { team: any }) {
  const manager = team.managerAssignments?.find((m: any) => m.role === 'manager')?.user;
  const assistant = team.managerAssignments?.find((m: any) => m.role === 'assistant')?.user;
  const rosterSize = team.rosterPlayers?.length ?? 0;

  const status = rosterSize >= team.rosterLimit ? 'Roster Full' : rosterSize === 0 ? 'Needs Players' : manager ? (assistant ? 'Fully Staffed' : 'Assistant Needed') : 'Vacant Team';

  return (
    <Link href={`/teams/${(team.teamCode || team.teamName).toString().toLowerCase()}`} aria-label={`Open ${team.teamName}`} className="card group block rounded-2xl border border-rsa-border p-4 focus:outline-none focus:ring-2 focus:ring-rsa-gold">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
          <Image src={logoPath(team)} alt={team.teamName} fill sizes="56px" className="object-contain" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{team.teamName}</h3>
            <div className="text-xs text-slate-400">{status}</div>
          </div>
          <div className="mt-2 text-sm text-slate-300">Manager: {manager ? manager.name ?? manager.discordId : '—'}</div>
          <div className="text-sm text-slate-300">Assistant: {assistant ? assistant.name ?? assistant.discordId : '—'}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
        <div>Roster: <span className="text-white">{rosterSize}/{team.rosterLimit}</span></div>
        <div>{team.results?.length ?? 0} recent results</div>
      </div>
    </Link>
  );
}
