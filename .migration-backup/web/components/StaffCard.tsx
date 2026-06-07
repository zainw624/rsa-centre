import Image from 'next/image';

export default function StaffCard({ user, role }: { user: any; role: string }) {
  return (
    <div className="card flex items-center gap-4 rounded-2xl border border-rsa-border p-4">
      <div className="relative h-12 w-12 overflow-hidden rounded-full">
        <Image src={user?.image || '/assets/england.png'} alt={user?.name ?? user?.discordId} fill sizes="48px" className="object-cover" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">{user?.name ?? user?.discordId}</div>
            <div className="text-xs text-slate-400">@{user?.discordId}</div>
          </div>
          <div className="text-xs text-slate-300">{role}</div>
        </div>
        <div className="mt-2 text-sm text-slate-300">Status: Active</div>
      </div>
    </div>
  );
}
