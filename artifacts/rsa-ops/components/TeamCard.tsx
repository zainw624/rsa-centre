import Image from 'next/image';
import Link from 'next/link';
import { Users, UserPlus, AlertCircle, ShieldAlert } from 'lucide-react';

function logoPath(team: any) {
  if (team.logo) return team.logo;
  const code = (team.teamCode || team.teamName || 'usa').toString().toLowerCase();
  return `/assets/${code}.png`;
}

export default function TeamCard({ team }: { team: any }) {
  const manager = team.managerAssignments?.find((m: any) => m.role === 'manager')?.user;
  const assistant = team.managerAssignments?.find((m: any) => m.role === 'assistant')?.user;
  const rosterSize = team.rosterPlayers?.length ?? 0;

  const isFull = rosterSize >= team.rosterLimit;
  const isEmpty = rosterSize === 0;
  const status = isFull ? 'Roster Full' : isEmpty ? 'Needs Players' : manager ? (assistant ? 'Fully Staffed' : 'Assistant Needed') : 'Vacant Team';

  return (
    <Link href={`/teams/${(team.teamCode || team.teamName).toString().toLowerCase()}`} className="card-panel interactive-panel p-5 group block">
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-background border border-border shadow-sm flex items-center justify-center p-1.5">
          <div className="relative w-full h-full">
            <Image src={logoPath(team)} alt={team.teamName} fill sizes="64px" className="object-contain" />
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground truncate font-display tracking-tight group-hover:text-primary transition-colors">{team.teamName}</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {team.group ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                Group {team.group}
              </span>
            ) : null}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[0.65rem] font-bold uppercase tracking-wider
              ${isFull ? 'bg-muted/50 border-border text-muted-foreground' : 
                isEmpty ? 'bg-destructive/10 border-destructive/20 text-destructive' : 
                'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
              {status}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Manager</span>
              <span className="font-medium text-foreground truncate ml-2">{manager?.name ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Assistant</span>
              <span className="font-medium text-foreground truncate ml-2">{assistant?.name ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-4 h-4 opacity-70" />
          <span><strong className="text-foreground">{rosterSize}</strong> / {team.rosterLimit}</span>
        </div>
        <div className="text-muted-foreground">
          <strong className="text-foreground">{team.results?.length ?? 0}</strong> matches
        </div>
      </div>
    </Link>
  );
}
