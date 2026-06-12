import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prismaClient';

export const runtime = 'nodejs';

/**
 * Owner-only endpoint to open/close the transfer window directly from the
 * website. Only the configured BOT_OWNER_ID may change the state. The bot can
 * still mirror state via /api/bot/transfer-window; this is the manual override.
 */
export async function POST(request: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const ownerId = process.env.BOT_OWNER_ID;
  if (!ownerId || session.user.discordId !== ownerId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const open = body.open === true;
  const guildId: string = process.env.DISCORD_GUILD_ID || 'default';

  const existing = await prisma.settings.findFirst();

  const settings = existing
    ? await prisma.settings.update({
        where: { id: existing.id },
        data: { transferWindowOpen: open },
      })
    : await prisma.settings.create({
        data: {
          guildId,
          transferWindowOpen: open,
          managerRoleNames: [],
          sanctionRoleNames: [],
          auditRoleNames: [],
          worldCupLockRoleNames: [],
          worldCupUnlockRoleNames: [],
          staffCentreRoleNames: [],
        },
      });

  return NextResponse.json({ ok: true, transferWindowOpen: settings.transferWindowOpen });
}
