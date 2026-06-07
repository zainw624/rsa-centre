import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const secret = request.headers.get('x-webhook-secret');
  if (!process.env.ROLES_WEBHOOK_SECRET || secret !== process.env.ROLES_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  // Expect payload: { discordId: string, roles: string[] }
  const { discordId, roles } = body;
  if (!discordId) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { discordId } });
    if (user) {
      await prisma.user.update({ where: { discordId }, data: { roles: roles || [] } });
    } else if (roles && roles.length) {
      // Optionally create a user placeholder when a staff member appears
      await prisma.user.create({ data: { discordId, roles } });
    }
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
