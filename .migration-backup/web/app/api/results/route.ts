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
  } catch (e) {}
}

export async function GET() {
  const results = await prisma.result.findMany({ orderBy: { matchDate: 'desc' } });
  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const roles = session.user.roles || [];
  const permission = session.user.permission || 'viewer';
  if (!(permission === 'owner' || roles.includes('RSA | Officials') || process.env.BOT_OWNER_ID === session.user.discordId)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const created = await prisma.result.create({ data: {
    fixtureId: body.fixtureId || null,
    homeTeam: body.homeTeam,
    awayTeam: body.awayTeam,
    homeScore: Number(body.homeScore || 0),
    awayScore: Number(body.awayScore || 0),
    competition: body.competition || null,
    matchDate: new Date(body.matchDate),
    status: body.status || 'completed',
  }});

  await notify('resultCreated', { id: created.id });
  await createNotification({
    title: 'Result recorded',
    message: `Result recorded for ${created.homeTeam} vs ${created.awayTeam}: ${created.homeScore}-${created.awayScore}.`,
    type: 'result',
    payload: { id: created.id, fixtureId: created.fixtureId },
    readBy: [],
  });

  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !session.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const roles = session.user.roles || [];
  const permission = session.user.permission || 'viewer';
  if (!(permission === 'owner' || roles.includes('RSA | Officials') || process.env.BOT_OWNER_ID === session.user.discordId)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
  const updated = await prisma.result.update({ where: { id: body.id }, data: {
    homeScore: Number(body.homeScore || 0),
    awayScore: Number(body.awayScore || 0),
    status: body.status || 'completed',
  }});

  await notify('resultUpdated', { id: updated.id });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const roles = session.user.roles || [];
  const permission = session.user.permission || 'viewer';
  if (!(permission === 'owner' || roles.includes('RSA | Officials') || process.env.BOT_OWNER_ID === session.user.discordId)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
  await prisma.result.delete({ where: { id } });
  await notify('resultDeleted', { id });
  return NextResponse.json({ ok: true });
}
