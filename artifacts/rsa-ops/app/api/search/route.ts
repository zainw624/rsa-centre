import { NextResponse } from 'next/server';
import { getSearchResults } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || undefined;

  if (!q.trim()) {
    return NextResponse.json({ query: q, results: [] });
  }

  const results = await getSearchResults(q, type);
  return NextResponse.json({ query: q, type: type || 'all', results });
}
