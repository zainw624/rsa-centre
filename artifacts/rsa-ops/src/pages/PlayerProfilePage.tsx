import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';

export default function PlayerProfilePage() {
  const params = useParams<{ playerId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/playerinfo?id=${params.playerId}`).then(r => r.json()).then(setProfile).catch(() => {}).finally(() => setLoading(false));
  }, [params.playerId]);

  if (loading) return <div className="text-slate-400">Loading…</div>;
  if (!profile || profile.error) return <div className="text-white">Player profile not found.</div>;

  const avatarUrl = profile.user?.image || `https://cdn.discordapp.com/embed/avatars/${(Number(profile.playerId) % 5) || 0}.png`;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Link href="/player-profiles" className="text-sm text-rsa-gold hover:underline">← Back to Player Profiles</Link>

      <div className="flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center card" style={{ background: 'rgba(15,23,42,0.7)' }}>
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-slate-900">
          <img src={avatarUrl} alt={profile.playerTag} className="object-cover w-full h-full" />
        </div>
        <div className="flex-1">
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Player profile</p>
          <h1 className="text-3xl font-semibold text-white">{profile.playerTag}</h1>
          <div className="mt-2 space-y-1 text-sm text-slate-300">
            <div>Discord ID: <span className="text-white">{profile.playerId}</span></div>
            <div>Username: <span className="text-white">{profile.user?.name || 'Unknown'}</span></div>
            <div>Current team: <span className="text-white">{profile.currentTeam?.teamName || 'Free Agent'}</span></div>
            <div>Status: <span className="text-white">{profile.currentStatus}</span></div>
            <div>Eligibility: <span className={`font-semibold ${profile.eligible ? 'text-emerald-400' : 'text-rose-400'}`}>{profile.eligible ? 'Eligible' : 'Ineligible'}</span></div>
            <div>Cup tied: <span className={`font-semibold ${profile.cupTied ? 'text-amber-300' : 'text-slate-400'}`}>{profile.cupTied ? 'Yes' : 'No'}</span></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-rsa-gold">Transfer history</p>
                <h2 className="text-xl font-semibold text-white">Recent activity</h2>
              </div>
              <span className="text-sm text-slate-400">{profile.totalTransfers} transfers</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {(profile.transfers ?? []).length === 0 ? (
                <p className="text-slate-500">No transfer history recorded.</p>
              ) : (
                (profile.transfers ?? []).map((transfer: any) => (
                  <div key={transfer.id} className="rounded-2xl p-3" style={{ background: 'rgba(15,23,42,0.6)' }}>
                    <div className="font-medium text-white">{transfer.action || transfer.type}</div>
                    <div>{transfer.fromTeam || 'N/A'} → {transfer.toTeam || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{new Date(transfer.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
        <aside className="space-y-4">
          <div className="card rounded-3xl p-6">
            <p className="text-sm uppercase tracking-widest text-rsa-gold">Roster history</p>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              {(profile.rosterHistory ?? []).length === 0 ? (
                <p className="text-slate-500">No roster history.</p>
              ) : (
                (profile.rosterHistory ?? []).map((r: any, i: number) => (
                  <div key={i}>{r.team?.teamName ?? '—'}</div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
