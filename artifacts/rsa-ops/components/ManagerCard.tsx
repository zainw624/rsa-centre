import Image from 'next/image';

export default function ManagerCard({ assignment }: { assignment: any }) {
  const user = assignment.user;
  const team = assignment.team;
  const roleLabel = assignment.role === 'assistant' ? 'Assistant Manager' : 'Manager';
  return (
    <div className="card flex items-center gap-4 rounded-2xl border border-rsa-border p-4">
      <div className="relative h-12 w-12 overflow-hidden rounded-full">
        <Image src={user?.image || '/assets/england.png'} alt={user?.name ?? 'Manager'} fill sizes="48px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-sm font-semibold text-white">{user?.name ?? 'Unknown'}</div>
          <div className="shrink-0 text-xs text-slate-300">{roleLabel}</div>
        </div>
        <div className="mt-2 text-sm text-slate-300">Team: {team?.teamName}</div>
      </div>
    </div>
  );
}
