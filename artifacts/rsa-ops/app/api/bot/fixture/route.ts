/**
 * POST /api/bot/fixture
 * ======================
 * Bot-only endpoint to create a scheduled fixture from a Discord command
 * (e.g. /announcefix). Mirrors /api/fixtures POST but authenticates with the
 * shared ROLES_SYNC_SECRET instead of a browser session, since the bot has no
 * NextAuth session.
 *
 * Auth: x-sync-secret header must match ROLES_SYNC_SECRET env var.
 *
 * Body:
 *   homeTeam      string   — home team name (required)
 *   awayTeam      string   — away team name (required)
 *   kickoff       string   — ISO date/time (required)
 *   homeTeamCode  string?  — e.g. "POR"
 *   awayTeamCode  string?  — e.g. "ESP"
 *   competition   string?  — defaults to "RSA Season 2026"
 *   group         string?  — A | B | C | D (folded into competition label)
 *   venue         string?
 *   notes         string?
 *   creatorId     string?  — Discord user ID who created it
 *   creatorName   string?
 *
 * Response 200: { ok, fixture }
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { createNotification } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function notify(eventType: string, payload: any) {
  try {
    const message = JSON.stringify({ eventType, payload, timestamp: new Date().toISOString() });
    await prisma.$executeRaw`NOTIFY rsa_updates, ${message}`;
  } catch {
    // best-effort; ignore
  }
}

export async function POST(request: Request) {
  const secret = request.headers.get('x-sync-secret');
  if (!process.env.ROLES_SYNC_SECRET || secret !== process.env.ROLES_SYNC_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { homeTeam, awayTeam, kickoff, homeTeamCode, awayTeamCode } = body;
  if (!homeTeam || !awayTeam || !kickoff) {
    return NextResponse.json({ error: 'homeTeam, awayTeam and kickoff are required' }, { status: 400 });
  }
  if (!homeTeamCode || !awayTeamCode) {
    return NextResponse.json({ error: 'homeTeamCode and awayTeamCode are required' }, { status: 400 });
  }

  const kickoffDate = new Date(kickoff);
  if (isNaN(kickoffDate.getTime())) {
    return NextResponse.json({ error: 'kickoff is not a valid date' }, { status: 400 });
  }

  const group = body.group ? String(body.group).toUpperCase() : null;
  let competition = body.competition ? String(body.competition) : 'RSA Season 2026';
  if (group && !competition.toLowerCase().includes('group')) {
    competition = `${competition} · Group ${group}`;
  }

  const fixture = await prisma.fixture.create({
    data: {
      homeTeam:     String(homeTeam),
      awayTeam:     String(awayTeam),
      homeTeamCode: body.homeTeamCode ? String(body.homeTeamCode) : '',
      awayTeamCode: body.awayTeamCode ? String(body.awayTeamCode) : '',
      kickoff:      kickoffDate,
      competition,
      venue:        body.venue || null,
      notes:        body.notes || null,
      creatorId:    body.creatorId || null,
      creatorName:  body.creatorName || null,
    },
  });

  await notify('fixtureCreated', { id: fixture.id, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam });
  await createNotification({
    title:   'Fixture added',
    message: `${fixture.homeTeam} vs ${fixture.awayTeam} has been added to the schedule.`,
    type:    'fixture',
    payload: { id: fixture.id, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam },
    readBy:  [],
  }).catch(() => null);

  return NextResponse.json({ ok: true, fixture });
}
