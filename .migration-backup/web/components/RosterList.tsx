import Image from 'next/image';

export default function RosterList({ team }: { team: any }) {
  return (
    <div className="card rounded-2xl border border-rsa-border p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-md">
          <Image src={team.logo || `/assets/${(team.teamCode||team.teamName).toLowerCase()}.png`} alt={team.teamName} fill sizes="48px" className="object-contain" />
        </div>
        <div>
          <div className="text-sm text-slate-400">{team.teamName}</div>
          <div className="text-sm text-white">Roster: {team.rosterPlayers?.length}/{team.rosterLimit}</div>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {team.rosterPlayers.map((r: any) => (
          <li key={r.id}>{r.playerTag} <span className="text-xs text-slate-500">({r.playerId})</span></li>
        ))}
      </ul>
    </div>
  );
}
