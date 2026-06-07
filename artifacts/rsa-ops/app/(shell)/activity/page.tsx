import ActivityClient, { ActivityEvent } from '@/components/ActivityClient';
import { getActivityEvents, getActivityFilterOptions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  let events: ActivityEvent[] = [];
  let options: any = { players: [], teams: [], staff: [], eventTypes: [] };
  let dbError = false;

  try {
    const [rawEvents, rawOptions] = await Promise.all([
      getActivityEvents(100),
      getActivityFilterOptions(),
    ]);
    events = (Array.isArray(rawEvents) ? rawEvents : []).map((event: any) => ({
      ...event,
      createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : null,
    })) as ActivityEvent[];
    options = rawOptions;
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Activity</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Activity Log</h1>
        <p className="mt-1 text-sm text-slate-500">Latest events and filtered activity timeline</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view activity data</p>
        </div>
      ) : (
        <ActivityClient
          initialEvents={events}
          players={options.players}
          teams={options.teams}
          staff={options.staff}
          eventTypes={options.eventTypes}
        />
      )}
    </div>
  );
}
