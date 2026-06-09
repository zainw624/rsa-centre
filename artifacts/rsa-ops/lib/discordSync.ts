/**
 * Shared Discord -> database sync logic for a single guild member.
 *
 * Used by:
 *   - POST /api/roles-sync          (real-time push from the Discord bot)
 *   - POST /api/admin/sync-discord  (bulk pull triggered from the website)
 *
 * Team role IDs are the source of truth for roster membership. A member is
 * placed on at most ONE team (players must never appear on multiple rosters),
 * and Free Agents (no team role) are never added to any roster.
 */
import { prisma } from '@/lib/prismaClient';
import { resolvePermission } from '@/lib/discord';
import { TEAMS } from '@/lib/teamRoles';
import { TRACKED_ROLES } from '@/lib/permissions';

const MANAGER_ROLE_NAMES   = ['RSA | Managers'];
const ASSISTANT_ROLE_NAMES = ['RSA | Assistant Managers'];

const TEAM_ROLE_ID_SET = new Set(TEAMS.map((t) => t.roleId));

export interface SyncMemberInput {
  discordId: string;
  name?: string | null;
  image?: string | null;
  roleIds?: string[];
  roleNames?: string[];
  syncedAt?: Date;
}

export interface SyncMemberResult {
  user: any;
  permission: string;
  teamsJoined: string[];
  teamDeactivated: number;
}

/**
 * True if the member holds any role we track (team, manager or staff). Members
 * with none of these (e.g. plain Free Agents) are skipped during bulk pulls.
 */
export function isTrackedMember(roleIds: string[], roleNames: string[]): boolean {
  if (roleIds.some((id) => TEAM_ROLE_ID_SET.has(id))) return true;
  if (roleNames.some((n) => TRACKED_ROLES.includes(n))) return true;
  return false;
}

export async function syncMemberRoles(input: SyncMemberInput): Promise<SyncMemberResult> {
  const { discordId } = input;
  const roleIds   = Array.isArray(input.roleIds)   ? input.roleIds   : [];
  const roleNames = Array.isArray(input.roleNames) ? input.roleNames : [];
  const syncedAt  = input.syncedAt ?? new Date();
  const botOwnerId = process.env.BOT_OWNER_ID;

  const permission = resolvePermission(roleNames, botOwnerId, discordId);

  // -- Upsert user ----------------------------------------------------------
  const updateData: any = { roles: roleNames, permission, updatedAt: syncedAt };
  if (input.name)  updateData.name  = input.name;
  if (input.image) updateData.image = input.image;

  const user = await prisma.user.upsert({
    where:  { discordId },
    update: updateData,
    create: {
      discordId,
      name:  input.name  ?? discordId,
      image: input.image ?? null,
      roles: roleNames,
      permission,
    },
  });

  // -- Resolve team membership (role ID is source of truth) -----------------
  const allTeams = await prisma.team.findMany();

  // Team role IDs are the ONLY source of truth. Resolve in canonical TEAMS
  // order so multi-role anomalies always pick the same (deterministic) team,
  // and a member is never placed on more than one roster.
  const memberRoleIds = new Set(roleIds);
  const matchedRoleIds = TEAMS.filter((t) => memberRoleIds.has(t.roleId)).map((t) => t.roleId);
  if (matchedRoleIds.length > 1) {
    console.warn(`[discordSync] ${discordId} holds ${matchedRoleIds.length} team roles — using first in canonical order`);
  }
  const finalTeamIds: string[] = [];
  if (matchedRoleIds.length) {
    const team = allTeams.find((t) => t.roleId === matchedRoleIds[0]);
    if (team) finalTeamIds.push(team.id);
  }

  const teamsJoined: string[] = [];

  // Deactivate roster rows for any team the member is no longer on.
  const deact = await prisma.rosterPlayer.updateMany({
    where: {
      userId: user.id,
      active: true,
      teamId: { notIn: finalTeamIds.length ? finalTeamIds : ['__none__'] },
    },
    data: { active: false },
  });

  for (const teamId of finalTeamIds) {
    const existing = await prisma.rosterPlayer.findFirst({ where: { userId: user.id, teamId } });
    if (existing) {
      if (!existing.active || (input.name && existing.playerTag !== input.name)) {
        await prisma.rosterPlayer.update({
          where: { id: existing.id },
          data:  { active: true, playerTag: input.name ?? existing.playerTag },
        });
      }
    } else {
      const team = allTeams.find((t: any) => t.id === teamId);
      await prisma.rosterPlayer.create({
        data: {
          playerId:  discordId,
          playerTag: input.name ?? discordId,
          userId:    user.id,
          teamId,
          joinedAt:  syncedAt,
          active:    true,
        },
      });
      teamsJoined.push(team?.teamName ?? teamId);
    }
  }

  // -- Manager assignments --------------------------------------------------
  try {
    const isManager   = roleNames.some((r) => MANAGER_ROLE_NAMES.includes(r));
    const isAssistant = roleNames.some((r) => ASSISTANT_ROLE_NAMES.includes(r));

    if (!isManager && !isAssistant) {
      await prisma.managerAssignment.updateMany({
        where: { userId: user.id, active: true },
        data:  { active: false, removedAt: syncedAt },
      });
    } else {
      const managerRole = isManager ? 'manager' : 'assistant';
      const activeTeamIds = finalTeamIds;

      await prisma.managerAssignment.updateMany({
        where: {
          userId: user.id,
          active: true,
          teamId: { notIn: activeTeamIds.length ? activeTeamIds : ['__none__'] },
        },
        data: { active: false, removedAt: syncedAt },
      });

      for (const teamId of activeTeamIds) {
        const existing = await prisma.managerAssignment.findFirst({
          where: { userId: user.id, teamId, active: true },
        });
        if (!existing) {
          await prisma.managerAssignment.create({
            data: { userId: user.id, teamId, role: managerRole, active: true, assignedAt: syncedAt },
          });
        } else if (existing.role !== managerRole) {
          await prisma.managerAssignment.update({ where: { id: existing.id }, data: { role: managerRole } });
        }
      }
    }
  } catch (err: any) {
    console.warn('[discordSync] manager sync error:', err?.message);
  }

  return { user, permission, teamsJoined, teamDeactivated: deact.count };
}

/** Deactivate all roster + manager rows for a member who left the guild. */
export async function deactivateMember(discordId: string, syncedAt = new Date()): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { discordId } });
  if (!user) return false;
  await Promise.all([
    prisma.rosterPlayer.updateMany({ where: { userId: user.id, active: true }, data: { active: false } }),
    prisma.managerAssignment.updateMany({ where: { userId: user.id, active: true }, data: { active: false, removedAt: syncedAt } }),
  ]);
  return true;
}
