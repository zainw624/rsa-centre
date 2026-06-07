import Image from 'next/image';
import Link from 'next/link';
import { getPlayerProfileById } from '@/lib/db';

export const dynamic = 'force-dynamic';
export default async function PlayerProfilePage({ params }: { params: Promise<{ playerId: string }> }) {
  const resolved = await params;
  const profile = await getPlayerProfileById(resolved.playerId);

  if (!profile) {
    return <div className="text-white">Player profile not found.</div>;
  }

  const avatarUrl = profile.user?.image || `https://cdn.discordapp.com/embed/avatars/${(Number(profile.playerId) % 5) || 0}.png`;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-rsa-border bg-slate-950/70 p-6 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-slate-900">
          <Image
            src={avatarUrl}
            alt={profile.playerTag}
            className="object-cover"
            fill
            unoptimized
          />
        </div>
        <div className="flex-1">
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Player profile</p>
          <h1 className="text-3xl font-semibold text-white">{profile.playerTag}</h1>
          <div className="mt-2 space-y-1 text-sm text-slate-300">
            <div>Discord ID: <span className="text-white">{profile.playerId}</span></div>
            <div>Username: <span className="text-white">{profile.user?.name || 'Unknown'}</span></div>
            <div>Current team: <span className="text-white">{profile.currentTeam?.teamName || 'Free Agent'}</span></div>
            <div>Current status: <span className="text-white">{profile.currentStatus}</span></div>
            <div>Eligibility: <span className={`font-semibold ${profile.eligible ? 'text-emerald-400' : 'text-rose-400'}`}>{profile.eligible ? 'Eligible' : 'Ineligible'}</span></div>
            <div>Cup tied: <span className={`font-semibold ${profile.cupTied ? 'text-amber-300' : 'text-slate-400'}`}>{profile.cupTied ? 'Yes' : 'No'}</span></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card rounded-3xl border border-rsa-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-rsa-gold">Transfer history</p>
                <h2 className="text-xl font-semibold text-white">Recent activity</h2>
              </div>
              <span className="text-sm text-slate-400">{profile.totalTransfers} transfers</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {profile.transfers.length === 0 ? (
                <p className="text-slate-500">No transfer history recorded.</p>
              ) : (
                profile.transfers.map((transfer: any) => (
                  <div key={transfer.id} className="rounded-2xl bg-slate-900/60 p-3">
                    <div className="font-medium text-white">{transfer.action || transfer.type}</div>
                    <div>{transfer.fromTeam || 'N/A'} → {transfer.toTeam || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{new Date(transfer.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card rounded-3xl border border-rsa-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-rsa-gold">Sanction history</p>
                <h2 className="text-xl font-semibold text-white">Disciplinary record</h2>
              </div>
              <span className="text-sm text-slate-400">{profile.totalSanctions} sanctions</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {profile.sanctions.length === 0 ? (
                <p className="text-slate-500">No sanctions on record.</p>
              ) : (
                profile.sanctions.map((sanction: any) => (
                  <div key={sanction.id} className="rounded-2xl bg-slate-900/60 p-3">
                    <div className="font-medium text-white">{sanction.sanctionType}</div>
                    <div>{sanction.reason || 'No reason provided'}</div>
                    <div className="text-xs text-slate-500">Status: {sanction.status} · {new Date(sanction.createdAt).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card rounded-3xl border border-rsa-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-rsa-gold">Activity timeline</p>
                <h2 className="text-xl font-semibold text-white">Recent events</h2>
              </div>
              <span className="text-sm text-slate-400">{profile.totalActivity} items</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {profile.activity.length === 0 ? (
                <p className="text-slate-500">No activity timeline entries found.</p>
              ) : (
                profile.activity.slice(0, 10).map((event: any) => (
                  <div key={event.id} className="rounded-2xl bg-slate-900/60 p-3">
                    <div>{event.text}</div>
                    <div className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card rounded-3xl border border-rsa-border p-6">
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Profile summary</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div>Discord ID: <span className="text-white">{profile.playerId}</span></div>
              <div>Active membership: <span className="text-white">{profile.currentStatus}</span></div>
              <div>Eligibility: <span className="text-white">{profile.eligible ? 'Eligible' : 'Ineligible'}</span></div>
              <div>Cup tied: <span className="text-white">{profile.cupTied ? 'Yes' : 'No'}</span></div>
              <div>Total transfers: <span className="text-white">{profile.totalTransfers}</span></div>
              <div>Total sanctions: <span className="text-white">{profile.totalSanctions}</span></div>
              <div>Total activity items: <span className="text-white">{profile.totalActivity}</span></div>
            </div>
          </section>

          <section className="card rounded-3xl border border-rsa-border p-6">
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Roster history</p>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              {profile.rosterHistory.length === 0 ? (
                <p className="text-slate-500">No roster history available.</p>
              ) : (
                profile.rosterHistory.map((entry: any) => (
                  <div key={entry.id} className="rounded-2xl bg-slate-900/60 p-3">
                    <div>{entry.team?.teamName || 'Unknown team'}</div>
                    <div className="text-xs text-slate-500">Joined: {new Date(entry.joinedAt).toLocaleDateString()} · Active: {entry.active ? 'Yes' : 'No'}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      <div>
        <Link href="/player-profiles" className="text-sm text-rsa-gold hover:underline">← Back to player profiles</Link>
      </div>
    </div>
  );
}
