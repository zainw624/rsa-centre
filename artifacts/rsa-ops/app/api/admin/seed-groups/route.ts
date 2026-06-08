import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prismaClient';

export const dynamic = 'force-dynamic';

const GROUPS: Record<string, { name: string; code: string; isHost?: boolean }[]> = {
  A: [
    { name: 'United States', code: 'USA', isHost: true },
    { name: 'Norway',        code: 'NOR' },
    { name: 'Croatia',       code: 'CRO' },
    { name: 'Japan',         code: 'JPN' },
  ],
  B: [
    { name: 'Ghana',   code: 'GHA' },
    { name: 'Turkiye', code: 'TUR' },
    { name: 'Brazil',  code: 'BRA' },
    { name: 'Belgium', code: 'BEL' },
  ],
  C: [
    { name: 'Portugal',    code: 'POR' },
    { name: 'England',     code: 'ENG' },
    { name: 'France',      code: 'FRA' },
    { name: 'Spain',       code: 'ESP' },
  ],
  D: [
    { name: 'Netherlands', code: 'NED' },
    { name: 'Germany',     code: 'GER' },
    { name: 'Senegal',     code: 'SEN' },
    { name: 'Morocco',     code: 'MAR' },
  ],
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const perm = (session?.user as any)?.permission ?? '';
  if (!session || !['owner', 'administrator', 'league'].includes(perm)) {
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

    const created: string[] = [];
    const skipped: string[] = [];

    for (const [groupKey, teams] of Object.entries(GROUPS)) {
      for (let i = 0; i < teams.length; i++) {
        const t = teams[i];
        const teamId = t.code.toLowerCase();

        // Upsert Team
        const team = await prisma.team.upsert({
          where: { teamId },
          create: {
            teamId,
            teamName: t.name,
            teamCode: t.code,
            group: groupKey,
            logo: `/assets/${teamId}.png`,
          },
          update: {
            group: groupKey,
            teamName: t.name,
          },
        });

        // Check for existing LeagueTable entry in this season+group
        const existing = await prisma.leagueTable.findFirst({
          where: { teamId: team.id, seasonId: season.id, group: groupKey },
        });

        if (!existing) {
          await prisma.leagueTable.create({
            data: {
              teamId: team.id,
              seasonId: season.id,
              group: groupKey,
              position: i + 1,
              played: 0, won: 0, drew: 0, lost: 0,
              goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
            },
          });
          created.push(`${groupKey}: ${t.name}`);
        } else {
          skipped.push(`${groupKey}: ${t.name}`);
        }
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
