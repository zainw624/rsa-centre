import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const playerId = url.searchParams.get('playerId');
  if (!playerId) return NextResponse.json({ error: 'missing' }, { status: 400 });

  // Check cup tied
  const cupTied = await prisma.sanction.findFirst({ where: { playerId, sanctionType: { contains: 'cup' }, status: 'active' } });
  const sanctioned = await prisma.sanction.findFirst({ where: { playerId, status: 'active' } });

  return NextResponse.json({ eligible: !cupTied && !sanctioned, cupTied: !!cupTied, sanctioned: !!sanctioned });
}
