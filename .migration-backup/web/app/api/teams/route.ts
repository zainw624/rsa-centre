import { NextResponse } from 'next/server';
import { getAllTeams } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const teams = await getAllTeams();
  return NextResponse.json(teams);
}
