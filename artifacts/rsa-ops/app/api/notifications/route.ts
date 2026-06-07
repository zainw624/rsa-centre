import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getNotificationsForUser, markNotificationsRead } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
  const notifications = await getNotificationsForUser(session.user.id, unreadOnly);
  return NextResponse.json(notifications);
}

export async function PATCH(request: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  await markNotificationsRead(session.user.id);
  return NextResponse.json({ ok: true });
}
