/**
 * League setup helpers — season + group standings seeding.
 *
 * seedSeasonGroups() initialises the current competitive season ("Season 2026")
 * and creates an empty LeagueTable row for each of the 16 canonical teams in its
 * World Cup group (A–D). This is what makes the Group Stage / League Table pages
 * show every team grouped, before any results have been recorded.
 *
 * Requires NO user login. Idempotent — safe to call repeatedly.
 */
import { prisma } from '@/lib/prismaClient';
import { TEAMS, ensureTeams, removeMorocco, teamIdForCode } from '@/lib/teamRoles';

export interface SeedGroupsResult {
  ok: boolean;
  seasonId: string;
  seasonName: string;
  created: string[];
  skipped: string[];
  message: string;
}

export async function seedSeasonGroups(): Promise<SeedGroupsResult> {
  // 1. Upsert Season 2026 and mark it current.
  let season = await prisma.season.findFirst({ where: { name: 'Season 2026' } });
  if (!season) {
    await prisma.season.updateMany({ where: { current: true }, data: { current: false } });
    season = await prisma.season.create({
      data: { name: 'Season 2026', current: true, startDate: new Date('2026-01-01') },
    });
  }

  // 2. Ensure all 16 canonical teams exist (with role IDs/logos) and purge Morocco.
  await ensureTeams(prisma);
  await removeMorocco(prisma);

  const created: string[] = [];
  const skipped: string[] = [];
  const groupPosition: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

  for (const t of TEAMS) {
    const teamId = teamIdForCode(t.code);
    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) continue;

    const position = ++groupPosition[t.group];

    const existing = await prisma.leagueTable.findFirst({
      where: { teamId: team.id, seasonId: season.id, group: t.group },
    });

    if (!existing) {
      await prisma.leagueTable.create({
        data: {
          teamId: team.id,
          seasonId: season.id,
          group: t.group,
          position,
          played: 0, won: 0, drew: 0, lost: 0,
          goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        },
      });
      created.push(`${t.group}: ${t.name}`);
    } else {
      skipped.push(`${t.group}: ${t.name}`);
    }
  }

  return {
    ok: true,
    seasonId: season.id,
    seasonName: season.name,
    created,
    skipped,
    message: `Seed complete — ${created.length} entries created, ${skipped.length} already existed.`,
  };
}
