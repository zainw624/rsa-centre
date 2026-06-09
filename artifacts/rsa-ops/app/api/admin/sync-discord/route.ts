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
import { prisma } from '@/lib/prismaClient';
import { fetchGuildRoles, fetchAllGuildMembers } from '@/lib/discord';
import { ensureTeams, removeMorocco } from '@/lib/teamRoles';
import { syncMemberRoles, isTrackedMember } from '@/lib/discordSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getServerSession(authOptions);
  const perm = (session?.user as any)?.permission ?? '';
  if (!session || !['owner', 'administrator', 'league'].includes(perm)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const syncedAt = new Date();

  try {
    // 1. Ensure canonical teams exist with correct role IDs, and purge Morocco.
    await ensureTeams(prisma);
    await removeMorocco(prisma);

    // 2. Load Discord role map + all members.
    const roleMap = await fetchGuildRoles();
    if (!roleMap || Object.keys(roleMap).length === 0) {
      return NextResponse.json(
        { error: 'discord_unavailable', message: 'Could not load Discord roles. Check DISCORD_BOT_TOKEN and DISCORD_GUILD_ID.' },
        { status: 502 },
      );
    }

    const members = await fetchAllGuildMembers();
    if (members === null) {
      return NextResponse.json(
        { error: 'members_unavailable', message: 'Could not fetch guild members. Ensure the bot has the SERVER MEMBERS INTENT enabled in the Discord Developer Portal.' },
        { status: 502 },
      );
    }

    // 3. Sync each tracked member.
    const processed = new Set<string>();
    let rostered = 0;

    for (const m of members) {
      const u = m.user;
      if (!u || u.bot) continue;

      const roleIds: string[]   = Array.isArray(m.roles) ? m.roles : [];
      const roleNames: string[] = roleIds.map((id) => roleMap[id]).filter(Boolean) as string[];

      if (!isTrackedMember(roleIds, roleNames)) continue;

      const name  = m.nick || u.global_name || u.username || u.id;
      const image = u.avatar
        ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`
        : null;

      const result = await syncMemberRoles({ discordId: u.id, name, image, roleIds, roleNames, syncedAt });
      processed.add(u.id);
      if (result.teamsJoined.length) rostered++;
    }

    // 4. Reconcile — anyone with active roster/manager rows who is no longer a
    //    tracked guild member (left the server / lost all roles) is deactivated.
    const activeRoster = await prisma.rosterPlayer.findMany({
      where: { active: true },
      select: { id: true, user: { select: { discordId: true } } },
    });
    const staleRosterIds = activeRoster
      .filter((r) => !r.user || !processed.has(r.user.discordId))
      .map((r) => r.id);
    if (staleRosterIds.length) {
      await prisma.rosterPlayer.updateMany({ where: { id: { in: staleRosterIds } }, data: { active: false } });
    }

    const activeMgr = await prisma.managerAssignment.findMany({
      where: { active: true },
      select: { id: true, user: { select: { discordId: true } } },
    });
    const staleMgrIds = activeMgr
      .filter((a) => !a.user || !processed.has(a.user.discordId))
      .map((a) => a.id);
    if (staleMgrIds.length) {
      await prisma.managerAssignment.updateMany({ where: { id: { in: staleMgrIds } }, data: { active: false, removedAt: syncedAt } });
    }

    // 5. Audit.
    try {
      await prisma.auditLog.create({
        data: {
          actionType:    'DISCORD_FULL_SYNC',
          sourceCommand: 'admin-sync-discord',
          userId:        (session.user as any)?.id ?? null,
          details: {
            membersFetched:     members.length,
            tracked:            processed.size,
            rostered,
            rosterDeactivated:  staleRosterIds.length,
            managerDeactivated: staleMgrIds.length,
            syncedAt,
          },
        },
      });
    } catch { /* non-fatal */ }

    return NextResponse.json({
      ok: true,
      membersFetched:     members.length,
      tracked:            processed.size,
      rostered,
      rosterDeactivated:  staleRosterIds.length,
      managerDeactivated: staleMgrIds.length,
      message: `Synced ${processed.size} members from Discord — ${rostered} on rosters. Deactivated ${staleRosterIds.length} stale roster entr${staleRosterIds.length === 1 ? 'y' : 'ies'}.`,
    });
  } catch (err: any) {
    console.error('[sync-discord] error:', err?.message);
    return NextResponse.json({ error: 'sync_failed', detail: err?.message }, { status: 500 });
  }
}
