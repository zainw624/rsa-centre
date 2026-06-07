import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { fetchGuildMember, fetchGuildRoles } from '@/lib/discord';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const secret = request.headers.get('x-sync-secret');
  if (!process.env.ROLES_SYNC_SECRET || secret !== process.env.ROLES_SYNC_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const discordIds = body.discordIds || null;

  // If no list provided, sync all local users
  const users = discordIds
    ? await prisma.user.findMany({ where: { discordId: { in: discordIds } } })
    : await prisma.user.findMany();

  const roleMap = await fetchGuildRoles();
  let updated = 0;

  for (const u of users) {
    try {
      const member = await fetchGuildMember(u.discordId).catch(() => null);
      if (!member) continue;
      const roleNames = (member.roles || []).map((r: string) => roleMap[r] || r).filter(Boolean);
      await prisma.user.update({ where: { id: u.id }, data: { roles: roleNames } });
      updated++;
    } catch (e) {
      // ignore per-user errors
    }
  }

  return NextResponse.json({ ok: true, updated });
}
