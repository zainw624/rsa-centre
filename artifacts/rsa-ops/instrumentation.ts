/**
 * Next.js instrumentation hook — runs once when a server instance boots.
 *
 * This is what makes the site populate itself from Discord with NO login and
 * NO manual admin clicks. On startup it seeds the season/groups and pulls every
 * roled member from the Discord server (teams, rosters, managers, staff), then
 * re-syncs on an interval so the site keeps reflecting the live Discord roster.
 *
 * Disable by setting AUTO_DISCORD_SYNC=off. Tune cadence with
 * AUTO_DISCORD_SYNC_MINUTES (default 10).
 */
export async function register() {
  // Only run in the Node.js server runtime (never during build or on the edge).
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.AUTO_DISCORD_SYNC === 'off') return;

  const g = globalThis as any;
  if (g.__rsaAutoSyncStarted) return;
  g.__rsaAutoSyncStarted = true;

  const minutes = Number(process.env.AUTO_DISCORD_SYNC_MINUTES) || 10;
  const intervalMs = Math.max(1, minutes) * 60_000;

  // Lazy-import so the hook never blocks server startup or pulls heavy modules
  // into the build graph.
  const runOnce = async (label: string) => {
    if (g.__rsaAutoSyncRunning) return; // never overlap runs
    g.__rsaAutoSyncRunning = true;
    try {
      const { seedSeasonGroups } = await import('@/lib/leagueSetup');
      const { syncAllFromDiscord } = await import('@/lib/discordSync');

      await seedSeasonGroups();
      const result = await syncAllFromDiscord();

      if (result.ok) {
        console.log(`[auto-sync:${label}] ${result.message}`);
      } else {
        console.warn(`[auto-sync:${label}] skipped — ${result.error} (check DISCORD_BOT_TOKEN / DISCORD_GUILD_ID and the bot's SERVER MEMBERS INTENT)`);
      }
    } catch (err: any) {
      console.error(`[auto-sync:${label}] failed:`, err?.message);
    } finally {
      g.__rsaAutoSyncRunning = false;
    }
  };

  // Initial run shortly after boot (don't block startup), then on an interval.
  setTimeout(() => { void runOnce('startup'); }, 4_000);
  const timer = setInterval(() => { void runOnce('interval'); }, intervalMs);
  // Don't keep the process alive solely for the timer.
  if (typeof timer.unref === 'function') timer.unref();
}
