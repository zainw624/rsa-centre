import { getAllTeams } from '@/lib/db';
import RostersExplorer from '@/components/RostersExplorer';
import { BrandHeader } from '@/components/BrandHeader';
import { Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RostersPage() {
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
        title="Team Rosters"
        subtitle="Explore active rosters, staff assignments, and player status across all teams"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center flex flex-col items-center">
          <Database className="w-10 h-10 text-amber-500/50 mb-3" />
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view roster data</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="card-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground font-display">No teams available</p>
          <p className="mt-1 text-sm text-muted-foreground font-medium">Teams and rosters will appear here once seeded</p>
        </div>
      ) : (
        <RostersExplorer teams={teams} />
      )}
    </div>
  );
}
