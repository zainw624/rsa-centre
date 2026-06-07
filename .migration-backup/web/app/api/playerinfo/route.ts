import { NextResponse } from 'next/server';
import { getAllPlayers, getPlayerProfileById } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (id) {
    const profile = await getPlayerProfileById(id);
    if (!profile) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    return NextResponse.json(profile);
  }

  const players = await getAllPlayers();
  return NextResponse.json(players);
}
