/**
 * League setup helpers — season + group standings seeding.
 *
 * seedSeasonGroups() initialises the current competitive season ("World Cup 2026")
 * and creates an empty LeagueTable row for each of the 16 canonical teams in its
 * World Cup group (A–D). This is what makes the Group Stage / League Table pages
 * show every team grouped, before any results have been recorded.
 *
 * Requires NO user login. Idempotent — safe to call repeatedly.
 */
import { prisma } from '@/lib/prismaClient';
import { TEAMS, ensureTeams, teamIdForCode } from '@/lib/teamRoles';

export interface SeedGroupsResult {
  ok: boolean;
  seasonId: string;
  seasonName: string;
  created: string[];
  skipped: string[];
  message: string;
}

export async function seedSeasonGroups(): Promise<SeedGroupsResult> {
  // 1. Upsert the current season and mark it current.
  // Migrate the legacy "Season 2026" name to "World Cup 2026" if it exists.
  const SEASON_NAME = 'World Cup 2026';
  await prisma.season.updateMany({ where: { name: 'Season 2026' }, data: { name: SEASON_NAME } });

  // Deterministically pick ONE canonical season (prefer the row already marked
  // current, then the newest) and guarantee exactly one row is current — so
  // getCurrentSeason() and league-table inserts never bind to an arbitrary row.
  let season = await prisma.season.findFirst({
    where: { name: SEASON_NAME },
    orderBy: [{ current: 'desc' }, { startDate: 'desc' }],
  });
  if (!season) {
    await prisma.season.updateMany({ where: { current: true }, data: { current: false } });
    season = await prisma.season.create({
      data: { name: SEASON_NAME, current: true, startDate: new Date('2026-01-01') },
    });
  } else {
    await prisma.season.updateMany({
      where: { current: true, NOT: { id: season.id } },
      data: { current: false },
    });
    if (!season.current) {
      season = await prisma.season.update({ where: { id: season.id }, data: { current: true } });
    }
  }

  // 2. Ensure all 16 canonical teams exist (with role IDs/logos).
  await ensureTeams(prisma);

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
