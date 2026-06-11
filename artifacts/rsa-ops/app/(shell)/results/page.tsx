import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prismaClient';
import ResultsClient from '@/components/ResultsClient';
import { can } from '@/lib/permissions';
import { BrandHeader } from '@/components/BrandHeader';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const session = (await getServerSession(authOptions as any)) as any;

  let results: any[] = [];
  let dbError = false;

  try {
    results = await prisma.result.findMany({ orderBy: { matchDate: 'desc' } });
  } catch {
    dbError = true;
  }

  const perm = session?.user?.permission ?? '';
  const isAdmin = can(perm, 'submitResults');

  return (
    <div className="space-y-6">
      <BrandHeader
        title="Match Results"
        subtitle="Completed match scores, statistics and match reports"
      />

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view results</p>
        </div>
      ) : (
        <section>
          <ResultsClient initial={results} isAdmin={isAdmin} />
        </section>
      )}
    </div>
  );
}
