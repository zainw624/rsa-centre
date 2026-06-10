import ActivityClient, { ActivityEvent } from '@/components/ActivityClient';
import { getActivityEvents, getActivityFilterOptions } from '@/lib/db';
import { BrandHeader } from '@/components/BrandHeader';

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
    <div className="space-y-6">
      <BrandHeader
        title="Activity Log"
        subtitle="Latest events, system records and filtered activity timeline"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view activity data</p>
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
