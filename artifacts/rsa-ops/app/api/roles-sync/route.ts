/**
 * POST /api/roles-sync
 *
 * Secure push endpoint called by the Discord bot whenever a member's roles
 * change, a member joins/leaves, or a manual sync is triggered.
 *
 * Authorization: x-sync-secret header must match ROLES_SYNC_SECRET env var.
 * This route is server-side only and must never be called from client code.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { resolvePermission } from '@/lib/discord';

export const runtime = 'nodejs';

// RSA manager role names (must match what the bot sends)
const MANAGER_ROLE_NAMES   = ['RSA | Managers'];
const ASSISTANT_ROLE_NAMES = ['RSA | Assistant Managers'];

// RSA verified role names — any of these means the member is a known RSA member
const VERIFIED_ROLE_NAMES = [
  'RSA | Founders', 'RSA | Co Founders', 'RSA | Executive',
  'RSA | Chairman', 'RSA | Vice Chairman', 'RSA | Board of Directors',
  'RSA | Director', 'RSA | Head of Development', 'RSA | Head Of Staff',
  'RSA | Developer', 'RSA | Senior Staff', 'RSA | Staff',
  'RSA | Media', 'RSA | Panel', 'RSA | Officials',
  'RSA | Managers', 'RSA | Assistant Managers',
  'RSA Verified',
];

function unauthorized(msg = 'unauthorized') {
  return NextResponse.json({ error: msg }, { status: 401 });
}

function badRequest(msg = 'bad_request') {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(request: Request) {
  // ── 1. Authenticate ──────────────────────────────────────────────────────
  const secret = request.headers.get('x-sync-secret');
  const configuredSecret = process.env.ROLES_SYNC_SECRET;

  if (!configuredSecret) {
    console.error('[roles-sync] ROLES_SYNC_SECRET is not configured');
    return unauthorized('server_misconfigured');
  }
  if (secret !== configuredSecret) {
    return unauthorized();
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  let body: any;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid_json');
  }

  const {
    discordId,
    username,
    displayName,
    avatar,
    roleIds   = [],
    roleNames = [],
    guildId,
    event     = 'member_update',
    timestamp,
  } = body;

  if (!discordId || typeof discordId !== 'string') {
    return badRequest('missing_discord_id');
  }

  // ── 3. Validate guild ────────────────────────────────────────────────────
  const expectedGuildId = process.env.DISCORD_GUILD_ID;
  if (expectedGuildId && guildId && guildId !== expectedGuildId) {
    return unauthorized('wrong_guild');
  }

  // ── 4. Resolve display name and avatar ──────────────────────────────────
  const resolvedName  = (displayName || username || null) as string | null;
  const resolvedImage = avatar
    ? (avatar.startsWith('http') ? avatar : `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`)
    : null;

  const botOwnerId = process.env.BOT_OWNER_ID;
  const syncedAt   = timestamp ? new Date(timestamp) : new Date();

  // ── 5. Handle member_leave ───────────────────────────────────────────────
  if (event === 'member_leave') {
    try {
      const user = await prisma.user.findUnique({ where: { discordId } });
      if (user) {
        await Promise.all([
          prisma.rosterPlayer.updateMany({
            where: { userId: user.id, active: true },
            data:  { active: false },
          }),
          prisma.managerAssignment.updateMany({
            where: { userId: user.id, active: true },
            data:  { active: false, removedAt: syncedAt },
          }),
        ]);
        await prisma.auditLog.create({
          data: {
            actionType:    'ROLE_SYNC_LEAVE',
            sourceCommand: 'roles-sync-webhook',
            userId:        user.id,
            details:       { event, guildId, syncedAt },
          },
        });
      }
      return NextResponse.json({ ok: true, event, action: 'deactivated' });
    } catch (err: any) {
      console.error('[roles-sync] member_leave error:', err?.message);
      return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
  }

  // ── 6. Resolve permission from roles ────────────────────────────────────
  const permission = resolvePermission(
    Array.isArray(roleNames) ? roleNames : [],
    botOwnerId,
    discordId,
  );

  // ── 7. Upsert User record ────────────────────────────────────────────────
  let user: any;
  try {
    const updateData: any = {
      roles:      Array.isArray(roleNames) ? roleNames : [],
      permission,
      updatedAt:  syncedAt,
    };
    if (resolvedName)  updateData.name  = resolvedName;
    if (resolvedImage) updateData.image = resolvedImage;

    user = await prisma.user.upsert({
      where:  { discordId },
      update: updateData,
      create: {
        discordId,
        name:       resolvedName  ?? discordId,
        image:      resolvedImage ?? null,
        roles:      Array.isArray(roleNames) ? roleNames : [],
        permission,
      },
    });
  } catch (err: any) {
    console.error('[roles-sync] user upsert error:', err?.message);
    return NextResponse.json({ error: 'user_upsert_failed' }, { status: 500 });
  }

  // ── 8. Sync team roster memberships ─────────────────────────────────────
  let teamsJoined: string[] = [];
  let teamsLeft:   string[] = [];

  try {
    const allTeams = await prisma.team.findMany();
    const memberTeamIds: string[] = [];

    for (const team of allTeams) {
      // Match by Discord role ID (preferred, exact)
      const matchById   = team.roleId && Array.isArray(roleIds) && roleIds.includes(team.roleId);
      // Match by role name equaling teamName or teamCode (fallback)
      const matchByName = Array.isArray(roleNames) && roleNames.some(
        (r: string) => r === team.teamName || r === team.teamCode,
      );

      if (matchById || matchByName) {
        memberTeamIds.push(team.id);
      }
    }

    // Deactivate roster entries for teams the user no longer belongs to
    const leftResult = await prisma.rosterPlayer.updateMany({
      where: {
        userId: user.id,
        active: true,
        teamId: { notIn: memberTeamIds },
      },
      data: { active: false },
    });
    teamsLeft = leftResult.count > 0 ? ['some'] : [];

    // Upsert active roster entries for current teams
    for (const teamId of memberTeamIds) {
      const existing = await prisma.rosterPlayer.findFirst({
        where: { userId: user.id, teamId },
      });

      if (existing) {
        if (!existing.active || (resolvedName && existing.playerTag !== resolvedName)) {
          await prisma.rosterPlayer.update({
            where: { id: existing.id },
            data:  { active: true, playerTag: resolvedName ?? existing.playerTag },
          });
        }
      } else {
        const team = allTeams.find((t) => t.id === teamId);
        await prisma.rosterPlayer.create({
          data: {
            playerId:  discordId,
            playerTag: resolvedName ?? discordId,
            userId:    user.id,
            teamId,
            joinedAt:  syncedAt,
            active:    true,
          },
        });
        teamsJoined.push(team?.teamName ?? teamId);
      }
    }
  } catch (err: any) {
    // Non-fatal — log but continue
    console.warn('[roles-sync] roster sync error:', err?.message);
  }

  // ── 9. Sync manager assignments ──────────────────────────────────────────
  try {
    const isManager   = Array.isArray(roleNames) && roleNames.some((r) => MANAGER_ROLE_NAMES.includes(r));
    const isAssistant = Array.isArray(roleNames) && roleNames.some((r) => ASSISTANT_ROLE_NAMES.includes(r));

    if (!isManager && !isAssistant) {
      // No longer in a management role — deactivate all assignments
      await prisma.managerAssignment.updateMany({
        where: { userId: user.id, active: true },
        data:  { active: false, removedAt: syncedAt },
      });
    } else {
      const managerRole = isManager ? 'manager' : 'assistant';
      // Get current active team memberships for this user
      const activeRoster = await prisma.rosterPlayer.findMany({
        where: { userId: user.id, active: true },
        select: { teamId: true },
      });
      const activeTeamIds = activeRoster.map((r) => r.teamId);

      // Deactivate assignments for teams user is no longer on
      await prisma.managerAssignment.updateMany({
        where: {
          userId: user.id,
          active: true,
          teamId: { notIn: activeTeamIds },
        },
        data: { active: false, removedAt: syncedAt },
      });

      // Upsert assignment for each active team
      for (const teamId of activeTeamIds) {
        const existing = await prisma.managerAssignment.findFirst({
          where: { userId: user.id, teamId, active: true },
        });
        if (!existing) {
          await prisma.managerAssignment.create({
            data: {
              userId:     user.id,
              teamId,
              role:       managerRole,
              active:     true,
              assignedAt: syncedAt,
            },
          });
        } else if (existing.role !== managerRole) {
          await prisma.managerAssignment.update({
            where: { id: existing.id },
            data:  { role: managerRole },
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('[roles-sync] manager sync error:', err?.message);
  }

  // ── 10. Write audit log ──────────────────────────────────────────────────
  try {
    await prisma.auditLog.create({
      data: {
        actionType:    'ROLE_SYNC_PUSH',
        sourceCommand: 'roles-sync-webhook',
        userId:        user.id,
        details: {
          event,
          guildId,
          permission,
          roleCount:   roleNames.length,
          teamsJoined,
          syncedAt,
        },
      },
    });
  } catch {
    // Audit log failures are non-fatal
  }

  return NextResponse.json({
    ok:         true,
    event,
    discordId,
    permission,
    rolesStored: Array.isArray(roleNames) ? roleNames.length : 0,
    teamsJoined,
    teamsLeft:   teamsLeft.length,
  });
}
