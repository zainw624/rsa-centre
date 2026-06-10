import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export const runtime = 'nodejs';

/**
 * Bot-only endpoint to update a signing's outcome after the player accepts or
 * declines the Discord contract. Guarded by `x-sync-secret` like the rest of
 * the `/api/bot/*` family.
 */
export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-sync-secret');
    if (!process.env.ROLES_SYNC_SECRET || secret !== process.env.ROLES_SYNC_SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transactionId, status, playerId, roleId } = body as {
      transactionId?: string;
      status?: string;
      playerId?: string;
      roleId?: string;
    };

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: transactionId, status' },
        { status: 400 }
      );
    }

    const normalized = status === 'accepted' || status === 'completed' ? 'accepted' : 'declined';

    // Update the matching transfer (no-op if it was never recorded).
    await prisma.transfer.updateMany({
      where: { transactionId },
      data: { status: normalized, updatedAt: new Date() },
    });

    // On decline, deactivate the roster row created when the signing started.
    if (normalized === 'declined' && playerId) {
      const team = roleId ? await prisma.team.findFirst({ where: { roleId } }) : null;
      await prisma.rosterPlayer.updateMany({
        where: {
          playerId,
          active: true,
          ...(team ? { teamId: team.id } : {}),
        },
        data: { active: false },
      });
    }

    return NextResponse.json({ ok: true, status: normalized });
  } catch (error) {
    console.error('❌ Bot sign-status endpoint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
