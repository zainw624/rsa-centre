import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUpcomingFixtures } from '@/lib/db';
import { can } from '@/lib/permissions';
import { TEAMS } from '@/lib/teamRoles';
import { BrandHeader } from '@/components/BrandHeader';
import FixturesClient from '@/components/FixturesClient';

export const dynamic = 'force-dynamic';

export default async function FixturesPage() {
  const session = (await getServerSession(authOptions as any)) as any;

  let upcoming: any[] = [];
  let dbError = false;

  try {
    upcoming = await getUpcomingFixtures(50);
  } catch {
    dbError = true;
  }

  const perm = session?.user?.permission ?? '';
  const isOwner = !!session?.user?.discordId && process.env.BOT_OWNER_ID === session.user.discordId;
  const isAdmin = can(perm, 'manageFixtures') || isOwner;

  // Only client-safe team fields — never expose Discord roleId to the browser.
  // `logo` is the asset slug (e.g. "usa", "norway") used for /assets/<logo>.png.
  const teams = TEAMS.map((t) => ({ name: t.name, code: t.code, group: t.group, logo: t.flag }));

  return (
    <div className="space-y-6">
      <BrandHeader
        title="Upcoming Fixtures"
        subtitle="Scheduled matches across all active competitions"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view fixtures</p>
        </div>
      ) : (
        <FixturesClient initial={upcoming} isAdmin={isAdmin} teams={teams} />
      )}
    </div>
  );
}
