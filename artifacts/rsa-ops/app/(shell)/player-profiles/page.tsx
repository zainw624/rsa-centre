import Image from 'next/image';
import Link from 'next/link';
import { getAllPlayers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PlayerProfilesPage() {
  let players: any[] = [];
  let dbError = false;

  try {
    players = await getAllPlayers();
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Player Profiles</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">All Registered Players</h1>
        <p className="mt-1 text-sm text-slate-500">Profiles populated automatically from Discord roles and database</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view player profiles</p>
        </div>
      ) : players.length === 0 ? (
        <div className="rounded-2xl border border-rsa-border bg-white/3 px-5 py-12 text-center">
          <p className="text-sm text-slate-400">No player profiles found</p>
          <p className="mt-1 text-xs text-slate-600">Players are registered automatically when they log in with Discord</p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player: any) => (
            <Link
              key={player.playerId}
              href={`/player-profiles/${player.playerId}`}
              className="card group rounded-2xl border border-rsa-border bg-white/3 p-5 transition hover:border-rsa-gold/40 hover:bg-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-rsa-border bg-slate-900">
                  <Image
                    src={player.user?.image || `https://cdn.discordapp.com/embed/avatars/${(Number(player.playerId) % 5) || 0}.png`}
                    alt={player.playerTag}
                    className="object-cover"
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-white">{player.playerTag}</h2>
                  <p className="truncate text-sm text-slate-400">{player.user?.name || 'Discord user'}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Team</span>
                  <span className="font-medium text-white">{player.currentTeam?.teamName || 'Free Agent'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-medium text-white">{player.currentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Appearances</span>
                  <span className="font-medium text-white">{player.rosterCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
