import { NextResponse } from 'next/server';
import { getTransfers, getPendingTransfers, getDeclinedTransfers, getTransfersByAction } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const action = url.searchParams.get('action');
  if (status === 'pending') {
    return NextResponse.json(await getPendingTransfers(50));
  }
  if (status === 'declined') {
    return NextResponse.json(await getDeclinedTransfers(50));
  }
  if (action) {
    return NextResponse.json(await getTransfersByAction(action, 50));
  }

  const transfers = await getTransfers(50);
  return NextResponse.json(transfers);
}
