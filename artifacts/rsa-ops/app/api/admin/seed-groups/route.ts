import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prismaClient';
import { TEAMS, ensureTeams, removeMorocco, teamIdForCode } from '@/lib/teamRoles';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const perm = (session?.user as any)?.permission ?? '';
  if (!session || !can(perm, 'manageCompetitions')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // 1. Upsert Season 2026
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

    return NextResponse.json({
      ok: true,
      seasonId: season.id,
      seasonName: season.name,
      created,
      skipped,
      message: `Seed complete — ${created.length} entries created, ${skipped.length} already existed.`,
    });
  } catch (err: any) {
    console.error('[seed-groups] error:', err?.message);
    return NextResponse.json({ error: 'Seed failed', detail: err?.message }, { status: 500 });
  }
}
