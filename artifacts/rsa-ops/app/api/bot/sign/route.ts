import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { TEAMS, teamIdForCode } from '@/lib/teamRoles';

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

    // Resolve to the canonical team. Discord role IDs are the single source of
    // truth, so a slug-style teamId from the bot must never create a second row.
    const canonicalDef =
      (roleId && TEAMS.find((t) => t.roleId === roleId)) ||
      TEAMS.find((t) => t.code === teamCode) ||
      TEAMS.find((t) => t.name === teamName) ||
      null;

    let team;
    if (canonicalDef) {
      const canonicalId = teamIdForCode(canonicalDef.code);
      team = await prisma.team.upsert({
        where: { teamId: canonicalId },
        update: { coachDiscordId: coachDiscordId || undefined },
        create: {
          teamId: canonicalId,
          teamName: canonicalDef.name,
          teamCode: canonicalDef.code,
          group: canonicalDef.group,
          roleId: canonicalDef.roleId,
          logo: `/assets/${canonicalDef.flag}.png`,
          coachDiscordId: coachDiscordId || null,
          rosterLimit: 16,
        },
      });
    } else {
      // Legacy fallback for teams not in the canonical list: resolve by role/code
      // /name before creating, so we still avoid duplicate rows.
      team =
        (roleId ? await prisma.team.findFirst({ where: { roleId } }) : null) ||
        (await prisma.team.findFirst({ where: { OR: [{ teamCode }, { teamName }] } }));
      if (!team) {
        team = await prisma.team.create({
          data: {
            teamId,
            teamName,
            teamCode: teamCode || '',
            logo: logo || null,
            roleId: roleId || null,
            coachDiscordId: coachDiscordId || null,
            rosterLimit: 16,
          },
        });
      } else if (coachDiscordId) {
        team = await prisma.team.update({ where: { id: team.id }, data: { coachDiscordId } });
      }
    }

    // Avoid duplicate active roster rows (auto-sync also derives rosters from roles).
    let rosterPlayer = await prisma.rosterPlayer.findFirst({
      where: { teamId: team.id, playerId, active: true },
    });
    if (!rosterPlayer) {
      rosterPlayer = await prisma.rosterPlayer.create({
        data: {
          playerId,
          playerTag,
          teamId: team.id,
          joinedAt: new Date(),
          active: true,
        },
      });
    }

    const transfer = await prisma.transfer.create({
      data: {
        transactionId: body.transactionId || '',
        type: 'sign',
        status: 'pending',
        action: 'sign',
        playerId,
        playerTag,
        fromTeam: 'Free Agent',
        toTeam: team.teamName,
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
        details: `Player ${playerTag} signing initiated for ${team.teamName}`,
      },
    });

    await prisma.activityLog.create({
      data: {
        type: 'sign',
        text: `Player ${playerTag} signing initiated for ${team.teamName}`,
        playerId,
        playerTag,
        teamId: team.id,
        teamName: team.teamName,
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
