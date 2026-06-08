/**
 * POST /api/bot/stats
 * =====================
 * Bot-only endpoint to submit player stats for a match.
 * Stats are INCREMENTED (additive) — each call adds to the season total.
 *
 * Auth: x-sync-secret header must match ROLES_SYNC_SECRET env var.
 *
 * Body:
 *   playerId    string  — Discord user ID
 *   playerTag   string  — display name / username
 *   goals       number? — goals scored this match (default 0)
 *   assists     number? — assists this match (default 0)
 *   cleanSheet  boolean?— 1 clean sheet if true (default false)
 *   motm        boolean?— 1 MOTM award if true (default false)
 *   teamName    string? — team name/code to link stat (optional)
 *   seasonId    string? — override season (uses current season by default)
 *   guildId     string? — Discord guild ID (for audit)
 *
 * Response 200: { ok, playerId, playerTag, goals, assists, cleanSheets, motm, seasonId }
 * Response 400: { error }
 * Response 401: { error: "Unauthorized" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { incrementPlayerStat, getCurrentSeason } from '@/lib/db';
import { prisma } from '@/lib/prismaClient';

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

  const { playerId, playerTag, goals, assists, cleanSheet, motm, teamName, seasonId: bodySeasonId } = body;

  if (!playerId || !playerTag) {
    return NextResponse.json({ error: 'playerId and playerTag are required' }, { status: 400 });
  }

  const goalsN       = Math.max(0, Number(goals  ?? 0));
  const assistsN     = Math.max(0, Number(assists ?? 0));
  const cleanSheetsN = cleanSheet ? 1 : 0;
  const motmN        = motm       ? 1 : 0;

  if (!Number.isInteger(goalsN) || !Number.isInteger(assistsN)) {
    return NextResponse.json({ error: 'goals and assists must be non-negative integers' }, { status: 400 });
  }

  // Resolve season
  let seasonId = bodySeasonId ?? null;
  if (!seasonId) {
    const current = await getCurrentSeason();
    seasonId = current?.id;
  }
  if (!seasonId) {
    return NextResponse.json({ error: 'No current season found — seed groups first or provide seasonId' }, { status: 400 });
  }

  // Resolve team
  let teamId: string | null = null;
  if (teamName) {
    const team = await prisma.team.findFirst({
      where: {
        OR: [
          { teamName: { equals: String(teamName), mode: 'insensitive' } },
          { teamCode: { equals: String(teamName), mode: 'insensitive' } },
          { teamId:   { equals: String(teamName).toLowerCase() } },
          { teamName: { contains: String(teamName), mode: 'insensitive' } },
        ],
      },
    });
    teamId = team?.id ?? null;
  }

  const updated = await incrementPlayerStat({
    playerId:    String(playerId),
    playerTag:   String(playerTag),
    seasonId,
    teamId,
    goals:       goalsN,
    assists:     assistsN,
    cleanSheets: cleanSheetsN,
    motm:        motmN,
  });

  return NextResponse.json({
    ok:          true,
    playerId:    updated.playerId,
    playerTag:   updated.playerTag,
    goals:       updated.goals,
    assists:     updated.assists,
    cleanSheets: updated.cleanSheets,
    motm:        updated.motm,
    seasonId:    updated.seasonId,
    teamId:      updated.teamId,
  });
}
