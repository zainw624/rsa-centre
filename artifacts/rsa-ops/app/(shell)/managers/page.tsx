import ManagerCard from '@/components/ManagerCard';
import { getManagerAssignmentsFromRoles } from '@/lib/db';
import { BrandHeader } from '@/components/BrandHeader';
import { GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ManagersPage() {
  let derived: any[] = [];
  let dbError = false;

  try {
    derived = await getManagerAssignmentsFromRoles();
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <BrandHeader
        title="Management Directory"
        subtitle="Active managers and assistant managers across the league"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view manager assignments</p>
        </div>
      ) : derived.length === 0 ? (
        <div className="card-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground font-display">No active managers</p>
          <p className="mt-1 text-sm text-muted-foreground font-medium">Manager assignments will appear here once synced from Discord</p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {derived.map((a: any, idx: number) => (
            <ManagerCard
              key={`${a.user.id}-${a.team?.id || 'noteam'}-${idx}`}
              assignment={{ user: a.user, team: a.team, role: a.role }}
            />
          ))}
        </section>
      )}
    </div>
  );
}
