/**
 * POST /api/bot/result
 * ======================
 * Bot-only endpoint to submit a match result and automatically
 * update both teams' LeagueTable standings.
 *
 * Auth: x-sync-secret header must match ROLES_SYNC_SECRET env var.
 *
 * Body:
 *   homeTeam    string  — team name, code, or teamId
 *   awayTeam    string  — team name, code, or teamId
 *   homeScore   number  — goals scored by home team
 *   awayScore   number  — goals scored by away team
 *   competition string? — e.g. "RSA Season 2026 Group A"
 *   seasonId    string? — override season (uses current season by default)
 *   guildId     string? — Discord guild ID (for audit)
 *   submittedById string? — Discord user ID who submitted
 *
 * Response 200: { ok, homeTeam, awayTeam, homeScore, awayScore, homeEntry, awayEntry }
 * Response 400: { error }
 * Response 401: { error: "Unauthorized" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateStandingsFromResult, getCurrentSeason, createNotification } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-sync-secret');
  if (!secret || secret !== process.env.ROLES_SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { homeTeam, awayTeam, homeScore, awayScore, competition, seasonId: bodySeasonId, submittedById } = body;

  if (!homeTeam || !awayTeam) {
    return NextResponse.json({ error: 'homeTeam and awayTeam are required' }, { status: 400 });
  }

  const hScore = Number(homeScore);
  const aScore = Number(awayScore);

  if (isNaN(hScore) || isNaN(aScore) || hScore < 0 || aScore < 0) {
    return NextResponse.json({ error: 'homeScore and awayScore must be non-negative numbers' }, { status: 400 });
  }

  // Resolve season
  let seasonId = bodySeasonId ?? null;
  if (!seasonId) {
    const current = await getCurrentSeason();
    seasonId = current?.id ?? undefined;
  }

  const result = await updateStandingsFromResult({
    homeTeamName:  String(homeTeam),
    awayTeamName:  String(awayTeam),
    homeScore:     hScore,
    awayScore:     aScore,
    seasonId:      seasonId ?? undefined,
    competition:   competition ? String(competition) : undefined,
    submittedById: submittedById ? String(submittedById) : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await createNotification({
    title:   'Result recorded',
    message: `${result.homeTeam} ${hScore}–${aScore} ${result.awayTeam}. Standings updated.`,
    type:    'result',
    payload: { homeTeam, awayTeam, homeScore: hScore, awayScore: aScore },
    readBy:  [],
  }).catch(() => null);

  return NextResponse.json(result);
}
