import Image from 'next/image';
import Link from 'next/link';
import { getAllPlayers } from '@/lib/db';
import { BrandHeader } from '@/components/BrandHeader';
import { Users, Shield } from 'lucide-react';

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
    <div className="space-y-6">
      <BrandHeader
        title="Registered Players"
        subtitle="Every player across the league and their current team"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view player profiles</p>
        </div>
      ) : players.length === 0 ? (
        <div className="card-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground font-display">No players registered</p>
          <p className="mt-1 text-sm text-muted-foreground font-medium">Players will appear here once they authenticate</p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map((player: any) => (
            <Link
              key={player.playerId}
              href={`/player-profiles/${player.playerId}`}
              className="card-panel p-5 group flex flex-col hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
                  <Image
                    src={player.user?.image || `https://cdn.discordapp.com/embed/avatars/${(Number(player.playerId) % 5) || 0}.png`}
                    alt={player.playerTag}
                    className="object-cover"
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 pt-1">
                  <h2 className="truncate text-base font-bold text-foreground font-display group-hover:text-primary transition-colors">{player.playerTag}</h2>
                  <p className="truncate text-xs font-medium text-muted-foreground mt-0.5">{player.user?.name || 'Discord user'}</p>
                </div>
              </div>
              
              <div className="mt-auto space-y-2 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Team</span>
                  <span className="font-bold text-foreground truncate pl-2">{player.currentTeam?.teamName || 'Free Agent'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Status</span>
                  <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    player.currentStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {player.currentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Caps</span>
                  <span className="font-mono font-bold text-foreground">{player.rosterCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
