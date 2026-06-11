import Image from 'next/image';
import { User } from 'lucide-react';

export default function ManagerCard({ assignment }: { assignment: any }) {
  const user = assignment.user;
  const team = assignment.team;
  const roleLabel = assignment.role === 'assistant' ? 'Assistant Manager' : 'Manager';
  const isManager = assignment.role === 'manager';

  return (
    <div className="card-panel p-4 flex items-center gap-4 group">
      <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
        {user?.image ? (
          <Image src={user.image} alt={user?.name ?? 'Manager'} fill sizes="48px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="truncate text-sm font-bold text-foreground">{user?.name ?? 'Unknown'}</h3>
          <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider border
            ${isManager ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-muted/50 border-border text-muted-foreground'}`}>
            {roleLabel}
          </span>
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {team?.teamName ? (
             <span>Team: <span className="font-medium text-foreground">{team.teamName}</span></span>
          ) : (
            'Unassigned'
          )}
        </div>
      </div>
    </div>
  );
}
