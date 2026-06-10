import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createNotification } from '@/lib/db';
import { can } from '@/lib/permissions';

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
  const upcoming = await prisma.fixture.findMany({
    where: { archived: false, status: 'scheduled' },
    orderBy: { kickoff: 'asc' },
    take: 50,
  });
  return NextResponse.json(upcoming);
}

export async function POST(request: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const permission = session.user.permission || 'viewer';
  if (!(can(permission, 'manageFixtures') || process.env.BOT_OWNER_ID === session.user.discordId)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  const homeTeam = typeof body.homeTeam === 'string' ? body.homeTeam.trim() : '';
  const awayTeam = typeof body.awayTeam === 'string' ? body.awayTeam.trim() : '';
  const kickoff = new Date(body.kickoff);

  if (!homeTeam || !awayTeam) {
    return NextResponse.json({ error: 'Home and away teams are required.' }, { status: 400 });
  }
  if (homeTeam === awayTeam) {
    return NextResponse.json({ error: 'Home and away teams must be different.' }, { status: 400 });
  }
  if (Number.isNaN(kickoff.getTime())) {
    return NextResponse.json({ error: 'A valid kickoff date and time is required.' }, { status: 400 });
  }

  const fixture = await prisma.fixture.create({ data: {
    homeTeam,
    awayTeam,
    homeTeamCode: body.homeTeamCode || null,
    awayTeamCode: body.awayTeamCode || null,
    kickoff,
    competition: body.competition || null,
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
