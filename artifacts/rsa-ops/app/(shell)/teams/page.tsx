import { getAllTeams } from '@/lib/db';
import TeamsClient from '@/components/TeamsClient';
import { BrandHeader } from '@/components/BrandHeader';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  let teams: any[] = [];
  let dbError = false;

  try {
    teams = await getAllTeams();
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <BrandHeader
        title="National Teams"
        subtitle="Manage and oversee all active national teams in the league"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-2 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view team data</p>
        </div>
      ) : (
        <section>
          <TeamsClient initial={teams} />
        </section>
      )}
    </div>
  );
}
