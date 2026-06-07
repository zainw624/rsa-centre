import { useEffect, useState } from 'react';
import { Link } from 'wouter';

export default function PlayerProfilesPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/playerinfo').then(r => r.json()).then(setPlayers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-rsa-gold">Player Profiles</p>
          <h1 className="text-2xl font-semibold text-white">All registered player profiles</h1>
        </div>
      </header>

      {loading ? <div className="text-slate-400">Loading…</div> : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player: any) => (
            <Link key={player.playerId} href={`/player-profiles/${player.playerId}`} className="card group rounded-3xl p-5 transition hover:border-rsa-gold/50 block">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-900">
                  <img
                    src={player.user?.image || `https://cdn.discordapp.com/embed/avatars/${(Number(player.playerId) % 5) || 0}.png`}
                    alt={player.playerTag}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{player.playerTag}</h2>
                  <p className="text-sm text-slate-400">{player.user?.name || 'Discord user'}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div>Discord ID: <span className="text-white">{player.playerId}</span></div>
                <div>Current team: <span className="text-white">{player.currentTeam?.teamName || 'Free Agent'}</span></div>
                <div>Status: <span className="text-white">{player.currentStatus}</span></div>
                <div>Roster appearances: <span className="text-white">{player.rosterCount}</span></div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
