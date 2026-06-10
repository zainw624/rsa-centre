/**
 * POST /api/roles-sync
 *
 * Secure push endpoint called by the Discord bot whenever a member's roles
 * change, a member joins/leaves, or a manual sync is triggered.
 *
 * Authorization: x-sync-secret header must match ROLES_SYNC_SECRET env var.
 * This route is server-side only and must never be called from client code.
 *
 * The actual reconciliation logic lives in lib/discordSync.ts so that this
 * real-time push and the website's bulk pull (/api/admin/sync-discord) share a
 * single source of truth.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { syncMemberRoles, deactivateMember } from '@/lib/discordSync';

export const runtime = 'nodejs';

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
  const syncedAt = timestamp ? new Date(timestamp) : new Date();

  // ── 5. Handle member_leave ───────────────────────────────────────────────
  if (event === 'member_leave') {
    try {
      const found = await deactivateMember(discordId, syncedAt);
      if (found) {
        const user = await prisma.user.findUnique({ where: { discordId } });
        if (user) {
          await prisma.auditLog.create({
            data: {
              actionType:    'ROLE_SYNC_LEAVE',
              sourceCommand: 'roles-sync-webhook',
              userId:        user.id,
              details:       { event, guildId, syncedAt },
            },
          });
        }
      }
      return NextResponse.json({ ok: true, event, action: 'deactivated' });
    } catch (err: any) {
      console.error('[roles-sync] member_leave error:', err?.message);
      return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
  }

  // ── 6. Reconcile member via shared sync logic ───────────────────────────
  try {
    const { user, permission, teamsJoined } = await syncMemberRoles({
      discordId,
      name:  resolvedName,
      image: resolvedImage,
      roleIds,
      roleNames,
      syncedAt,
    });

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
            roleCount: Array.isArray(roleNames) ? roleNames.length : 0,
            teamsJoined,
            syncedAt,
          },
        },
      });
    } catch {
      // Audit log failures are non-fatal.
    }

    return NextResponse.json({
      ok:          true,
      event,
      discordId,
      permission,
      rolesStored: Array.isArray(roleNames) ? roleNames.length : 0,
      teamsJoined,
    });
  } catch (err: any) {
    console.error('[roles-sync] sync error:', err?.message);
    return NextResponse.json({ error: 'sync_failed' }, { status: 500 });
  }
}
