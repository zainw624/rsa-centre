import { NextResponse } from 'next/server';
import { Client } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function createStream(signal: AbortSignal) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query('LISTEN rsa_updates');

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const onNotification = (msg: { payload?: string }) => {
        if (!msg.payload) return;
        controller.enqueue(encoder.encode(`event: update\ndata: ${msg.payload}\n\n`));
      };

      client.on('notification', onNotification);
      controller.enqueue(encoder.encode('event: ready\ndata: connected\n\n'));

      const cleanup = async () => {
        client.off('notification', onNotification);
        await client.end().catch(() => null);
        controller.close();
      };

      signal.addEventListener('abort', () => {
        cleanup().catch(() => null);
      });
    },
    cancel() {
      client.end().catch(() => null);
    },
  });

  return stream;
}

export async function GET(request: Request) {
  const stream = await createStream(request.signal);
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
