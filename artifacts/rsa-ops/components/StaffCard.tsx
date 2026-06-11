import Image from 'next/image';
import { shortRole } from '@/lib/permissions';
import { Shield } from 'lucide-react';

export default function StaffCard({ user, role }: { user: any; role: string }) {
  return (
    <div className="card-panel p-4 flex items-center gap-4 group">
      <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-border group-hover:border-primary/40 transition-colors bg-muted flex items-center justify-center">
        {user?.image ? (
          <Image src={user.image} alt={user?.name ?? 'Staff member'} fill sizes="48px" className="object-cover" />
        ) : (
          <Shield className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="truncate text-sm font-bold text-foreground">{user?.name ?? 'Unknown'}</h3>
          <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[0.6rem] font-bold uppercase tracking-wider">
            {shortRole(role)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground font-medium">Active Status</span>
        </div>
      </div>
    </div>
  );
}
