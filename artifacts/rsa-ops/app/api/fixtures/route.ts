import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createNotification } from '@/lib/db';

export const runtime = 'nodejs';

async function notify(eventType: string, payload: any) {
  try {
    const message = JSON.stringify({ eventType, payload, timestamp: new Date().toISOString() });
    await prisma.$executeRaw`NOTIFY rsa_updates, ${message}`;
  } catch (e) {
    // ignore
  }
}

export async function GET() {
  const upcoming = await prisma.fixture.findMany({ where: { archived: false }, orderBy: { kickoff: 'asc' } });
  return NextResponse.json(upcoming);
}

export async function POST(request: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const roles = session.user.roles || [];
  const permission = session.user.permission || 'viewer';
  if (!(permission === 'administrator' || permission === 'league' || roles.includes('RSA | Officials') || process.env.BOT_OWNER_ID === session.user.discordId)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const fixture = await prisma.fixture.create({ data: {
    homeTeam: body.homeTeam,
    awayTeam: body.awayTeam,
    homeTeamCode: body.homeTeamCode,
    awayTeamCode: body.awayTeamCode,
    kickoff: new Date(body.kickoff),
    competition: body.competition,
    venue: body.venue || null,
    notes: body.notes || null,
    creatorId: session.user.id,
    creatorName: session.user.name,
  }});

  await notify('fixtureCreated', { id: fixture.id, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam });
  await createNotification({
    title: 'Fixture added',
    message: `${fixture.homeTeam} vs ${fixture.awayTeam} has been added to the schedule.`,
    type: 'fixture',
    payload: { id: fixture.id, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam },
    readBy: [],
  });

  return NextResponse.json(fixture);
}
