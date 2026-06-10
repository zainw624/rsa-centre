import { NextResponse } from 'next/server';
import { getAllTeams } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const teams = await getAllTeams();
  // Strip internal-only fields — Discord role IDs must never reach the client.
  const safe = teams.map(({ roleId, coachDiscordId, ...rest }: any) => rest);
  return NextResponse.json(safe);
}
