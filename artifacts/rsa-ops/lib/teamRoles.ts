/**
 * Canonical RSA team definitions — the single source of truth for the 16
 * World Cup teams and their Discord role IDs.
 *
 * IMPORTANT: roleId values are INTERNAL ONLY. Never send them to the browser
 * or include them in any client-facing API response.
 */

export const FREE_AGENT_ROLE_ID = '1469680400111501455';

export interface TeamDef {
  name: string;
  code: string;
  group: 'A' | 'B' | 'C' | 'D';
  roleId: string;
  flag: string; // asset slug under /public/assets/<flag>.png
}

export const TEAMS: TeamDef[] = [
  // Group A
  { name: 'United States', code: 'USA', group: 'A', roleId: '1512180469666414704', flag: 'usa' },
  { name: 'Norway',        code: 'NOR', group: 'A', roleId: '1512180859241758780', flag: 'norway' },
  { name: 'Croatia',       code: 'CRO', group: 'A', roleId: '1512181006088798328', flag: 'croatia' },
  { name: 'Japan',         code: 'JPN', group: 'A', roleId: '1512180583042781284', flag: 'japan' },
  // Group B
  { name: 'Ghana',         code: 'GHA', group: 'B', roleId: '1512181058387578960', flag: 'ghana' },
  { name: 'Türkiye',       code: 'TUR', group: 'B', roleId: '1512180702546890752', flag: 'turkiye' },
  { name: 'Brazil',        code: 'BRA', group: 'B', roleId: '1512181130940387430', flag: 'brazil' },
  { name: 'Belgium',       code: 'BEL', group: 'B', roleId: '1512180623278739587', flag: 'belgium' },
  // Group C
  { name: 'Portugal',      code: 'POR', group: 'C', roleId: '1512180497701273641', flag: 'portugal' },
  { name: 'England',       code: 'ENG', group: 'C', roleId: '1512181202252201984', flag: 'england' },
  { name: 'France',        code: 'FRA', group: 'C', roleId: '1512181238444724395', flag: 'france' },
  { name: 'Spain',         code: 'ESP', group: 'C', roleId: '1512180540436906044', flag: 'spain' },
  // Group D
  { name: 'Netherlands',   code: 'NED', group: 'D', roleId: '1512180758653960312', flag: 'netherlands' },
  { name: 'Germany',       code: 'GER', group: 'D', roleId: '1512180806414635039', flag: 'germany' },
  { name: 'Senegal',       code: 'SEN', group: 'D', roleId: '1512180889663180920', flag: 'senegal' },
  { name: 'Sweden',        code: 'SWE', group: 'D', roleId: '1512811729166405763', flag: 'sweden' },
];

/** Alternative team-name spellings → canonical team name. */
export const TEAM_NAME_ALIASES: Record<string, string> = {
  USA: 'United States',
  Turkiye: 'Türkiye',
};

/** Set of all valid team role IDs (source of truth for "is on a team"). */
export const TEAM_ROLE_IDS = new Set(TEAMS.map((t) => t.roleId));

export function teamIdForCode(code: string): string {
  return code.toLowerCase();
}

export function resolveTeamName(name: string): string {
  return TEAM_NAME_ALIASES[name] ?? name;
}

/** Returns the TeamDef whose roleId is present in the given role-id list. */
export function teamDefForRoleIds(roleIds: string[]): TeamDef | null {
  for (const t of TEAMS) {
    if (roleIds.includes(t.roleId)) return t;
  }
  return null;
}

/**
 * Upsert all 16 canonical teams into the database, ensuring each has the
 * correct Discord role ID, group, code, name and logo. Safe to call repeatedly.
 */
export async function ensureTeams(prisma: any): Promise<void> {
  for (const t of TEAMS) {
    const teamId = teamIdForCode(t.code);
    const logo = `/assets/${t.flag}.png`;
    await prisma.team.upsert({
      where: { teamId },
      create: {
        teamId,
        teamName: t.name,
        teamCode: t.code,
        group: t.group,
        roleId: t.roleId,
        logo,
      },
      update: {
        teamName: t.name,
        teamCode: t.code,
        group: t.group,
        roleId: t.roleId,
        logo,
      },
    });
  }
}

/**
 * Best-effort removal of any legacy "Morocco" team and its dependent records.
 * Morocco has been permanently replaced by Sweden across the platform.
 */
export async function removeMorocco(prisma: any): Promise<void> {
  try {
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { teamName: { contains: 'Morocco', mode: 'insensitive' } },
          { teamCode: { in: ['MAR', 'MOR'] } },
          { teamId: { in: ['mar', 'mor'] } },
        ],
      },
    });

    for (const team of teams) {
      // Delete dependent rows that require a team relation.
      await prisma.leagueTable.deleteMany({ where: { teamId: team.id } });
      await prisma.rosterPlayer.deleteMany({ where: { teamId: team.id } });
      await prisma.managerAssignment.deleteMany({ where: { teamId: team.id } });
      await prisma.playerStat.deleteMany({ where: { teamId: team.id } });
      await prisma.award.deleteMany({ where: { teamId: team.id } });
      await prisma.staffRole.deleteMany({ where: { teamId: team.id } });
      // Detach optional references so the team can be deleted.
      await prisma.fixture.updateMany({ where: { teamId: team.id }, data: { teamId: null } });
      await prisma.result.updateMany({ where: { teamId: team.id }, data: { teamId: null } });
      await prisma.sanction.updateMany({ where: { teamId: team.id }, data: { teamId: null } });
      await prisma.transfer.updateMany({ where: { teamId: team.id }, data: { teamId: null } });
      await prisma.team.delete({ where: { id: team.id } });
    }
  } catch (err: any) {
    console.warn('[teamRoles] removeMorocco cleanup skipped:', err?.message);
  }
}

/**
 * Remove any team row whose teamId is not one of the 16 canonical teams. These
 * arise when something upserts a team using a non-canonical id (e.g. a slug like
 * "france" instead of "fra"), producing duplicate cards on the site. History
 * (fixtures/results/sanctions/transfers) is reassigned to the canonical team
 * that shares the same Discord role; derived rows (rosters/managers/standings)
 * are deleted because the auto-sync rebuilds them from Discord roles. Safe to
 * call repeatedly.
 */
export async function removeNonCanonicalTeams(prisma: any): Promise<void> {
  try {
    const canonicalIds = new Set(TEAMS.map((t) => teamIdForCode(t.code)));
    const allTeams = await prisma.team.findMany();

    for (const team of allTeams) {
      if (canonicalIds.has(team.teamId)) continue;

      // Reassign historical references to the canonical team with the same role.
      const sibling = team.roleId
        ? await prisma.team.findFirst({
            where: { roleId: team.roleId, teamId: { in: Array.from(canonicalIds) } },
          })
        : null;
      const reassignTo = sibling?.id ?? null;

      await prisma.fixture.updateMany({ where: { teamId: team.id }, data: { teamId: reassignTo } });
      await prisma.result.updateMany({ where: { teamId: team.id }, data: { teamId: reassignTo } });
      await prisma.sanction.updateMany({ where: { teamId: team.id }, data: { teamId: reassignTo } });
      await prisma.transfer.updateMany({ where: { teamId: team.id }, data: { teamId: reassignTo } });

      // Derived rows are rebuilt from Discord roles / re-seeded, so drop them.
      await prisma.leagueTable.deleteMany({ where: { teamId: team.id } });
      await prisma.rosterPlayer.deleteMany({ where: { teamId: team.id } });
      await prisma.managerAssignment.deleteMany({ where: { teamId: team.id } });
      await prisma.playerStat.deleteMany({ where: { teamId: team.id } });
      await prisma.award.deleteMany({ where: { teamId: team.id } });
      await prisma.staffRole.deleteMany({ where: { teamId: team.id } });
      await prisma.team.delete({ where: { id: team.id } });

      console.log(
        `[teamRoles] Removed non-canonical team "${team.teamName}" (${team.teamId})`
      );
    }
  } catch (err: any) {
    console.warn('[teamRoles] removeNonCanonicalTeams cleanup skipped:', err?.message);
  }
}
