import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { seedSeasonGroups } from '@/lib/leagueSetup';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const perm = (session?.user as any)?.permission ?? '';
  if (!session || !can(perm, 'manageCompetitions')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await seedSeasonGroups();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[seed-groups] error:', err?.message);
    return NextResponse.json({ error: 'Seed failed', detail: err?.message }, { status: 500 });
  }
}
