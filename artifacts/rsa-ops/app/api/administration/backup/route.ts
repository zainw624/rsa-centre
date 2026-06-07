import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prismaClient';

export const runtime = 'nodejs';

function isAdminUser(session: any) {
  const roles = session.user?.roles || [];
  return session.user?.permission === 'owner'
    || roles.includes('RSA | Founders')
    || roles.includes('RSA | Co Founders')
    || roles.includes('RSA | Executive')
    || process.env.BOT_OWNER_ID === session.user?.discordId;
}

export async function POST(request: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user || !isAdminUser(session)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  await prisma.auditLog.create({
    data: {
      actionType: 'backup.triggered',
      sourceCommand: 'administration.backup',
      userId: session.user.id,
      details: { triggeredAt: new Date().toISOString() },
    },
  });

  return NextResponse.json({ ok: true, message: 'Backup trigger recorded.' });
}
