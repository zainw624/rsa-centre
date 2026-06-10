/**
 * POST /api/admin/sync-discord
 *
 * Website-triggered FULL pull sync. Fetches every guild member from the Discord
 * REST API and reconciles the database so rosters, managers and staff exactly
 * reflect current Discord role membership. Admin-only.
 *
 * Role IDs are used internally as the source of truth and are never returned
 * to the client.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncAllFromDiscord } from '@/lib/discordSync';
import { can } from '@/lib/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getServerSession(authOptions);
  const perm = (session?.user as any)?.permission ?? '';
  if (!session || !can(perm, 'syncDiscord')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await syncAllFromDiscord({ actorUserId: (session.user as any)?.id ?? null });

    if (!result.ok) {
      if (result.error === 'discord_unavailable') {
        return NextResponse.json(
          { error: 'discord_unavailable', message: 'Could not load Discord roles. Check DISCORD_BOT_TOKEN and DISCORD_GUILD_ID.' },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { error: 'members_unavailable', message: 'Could not fetch guild members. Ensure the bot has the SERVER MEMBERS INTENT enabled in the Discord Developer Portal.' },
        { status: 502 },
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[sync-discord] error:', err?.message);
    return NextResponse.json({ error: 'sync_failed', detail: err?.message }, { status: 500 });
  }
}
