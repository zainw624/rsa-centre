import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-sync-secret');
    if (!process.env.ROLES_SYNC_SECRET || secret !== process.env.ROLES_SYNC_SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, teamName, teamCode, logo, roleId, coachDiscordId, playerId, playerTag } = body;

    if (!teamId || !teamName || !playerId || !playerTag) {
      return NextResponse.json(
        { error: 'Missing required fields: teamId, teamName, playerId, playerTag' },
        { status: 400 }
      );
    }

    const team = await prisma.team.upsert({
      where: { teamId },
      update: {
        teamName,
        teamCode: teamCode || '',
        logo: logo || null,
        roleId: roleId || null,
        coachDiscordId: coachDiscordId || null,
      },
      create: {
        teamId,
        teamName,
        teamCode: teamCode || '',
        logo: logo || null,
        roleId: roleId || null,
        coachDiscordId: coachDiscordId || null,
        rosterLimit: 16,
      },
    });

    const rosterPlayer = await prisma.rosterPlayer.create({
      data: {
        playerId,
        playerTag,
        teamId: team.id,
        joinedAt: new Date(),
      },
    });

    const transfer = await prisma.transfer.create({
      data: {
        transactionId: body.transactionId || '',
        type: 'sign',
        status: 'pending',
        action: 'sign',
        playerId,
        playerTag,
        fromTeam: 'Free Agent',
        toTeam: teamName,
        teamId: team.id,
        sourceCommand: 'sign',
        reason: 'Signing initiated via sign command',
        guildId: body.guildId || '',
        staffId: body.staffId || '',
      },
    });

    await prisma.auditLog.create({
      data: {
        actionType: 'sign_initiated',
        sourceCommand: 'sign',
        userId: body.staffId || '',
        targetPlayerId: playerId,
        targetTeamId: team.id,
        details: `Player ${playerTag} signing initiated for ${teamName}`,
      },
    });

    await prisma.activityLog.create({
      data: {
        type: 'sign',
        text: `Player ${playerTag} signing initiated for ${teamName}`,
        playerId,
        playerTag,
        teamId: team.id,
        teamName,
        staffId: body.staffId || null,
        metadata: {
          transactionId: body.transactionId,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      team: {
        id: team.id,
        teamId: team.teamId,
        teamName: team.teamName,
        teamCode: team.teamCode,
      },
      rosterPlayer: {
        id: rosterPlayer.id,
        playerId: rosterPlayer.playerId,
        playerTag: rosterPlayer.playerTag,
      },
      transfer: {
        id: transfer.id,
        transactionId: transfer.transactionId,
        status: transfer.status,
      },
    });
  } catch (error) {
    console.error('❌ Bot sign endpoint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
