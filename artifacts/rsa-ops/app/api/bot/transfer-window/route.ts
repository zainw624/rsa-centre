import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export const runtime = 'nodejs';

/**
 * Bot-only endpoint to mirror the transfer-window open/closed state into the
 * website database so it shows correctly on the site. The bot owns the state
 * (via /twopen and /twclose); the website is just a reader. Guarded by
 * `x-sync-secret` like the rest of the `/api/bot/*` family.
 */
export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-sync-secret');
    if (!process.env.ROLES_SYNC_SECRET || secret !== process.env.ROLES_SYNC_SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const open = body.open === true;
    const guildId: string = body.guildId || process.env.DISCORD_GUILD_ID || 'default';

    const existing = await prisma.settings.findFirst({ where: { guildId } });

    const settings = existing
      ? await prisma.settings.update({
          where: { guildId },
          data: { transferWindowOpen: open },
        })
      : await prisma.settings.create({
          data: {
            guildId,
            transferWindowOpen: open,
            botOwnerId: body.botOwnerId || null,
            managerRoleNames: [],
            sanctionRoleNames: [],
            auditRoleNames: [],
            worldCupLockRoleNames: [],
            worldCupUnlockRoleNames: [],
            staffCentreRoleNames: [],
          },
        });

    return NextResponse.json({ ok: true, transferWindowOpen: settings.transferWindowOpen });
  } catch (error) {
    console.error('❌ Bot transfer-window endpoint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
