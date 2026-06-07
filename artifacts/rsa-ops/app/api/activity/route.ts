import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const playerId = url.searchParams.get('playerId');
  const teamId = url.searchParams.get('teamId');
  const staffId = url.searchParams.get('staffId');
  const type = url.searchParams.get('type');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  const limit = Number(url.searchParams.get('limit') || 100);

  const conditions: any[] = [];

  if (playerId) {
    conditions.push({ playerId });
  }
  if (teamId) {
    conditions.push({ teamId });
  }
  if (staffId) {
    conditions.push({ staffId });
  }
  if (type) {
    conditions.push({ type });
  }

  if (startDate || endDate) {
    const createdAt: any = {};
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && !Number.isNaN(start.getTime())) {
      createdAt.gte = start;
    }
    if (end && !Number.isNaN(end.getTime())) {
      createdAt.lte = end;
    }
    if (Object.keys(createdAt).length) {
      conditions.push({ createdAt });
    }
  }

  const where = conditions.length ? { AND: conditions } : undefined;
  const activity = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json(activity);
}
