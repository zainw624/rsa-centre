import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prismaClient';
import ResultsClient from '@/components/ResultsClient';
import { can } from '@/lib/permissions';

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
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Results</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Match Results</h1>
        <p className="mt-1 text-sm text-slate-500">Completed match scores and reports</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view results</p>
        </div>
      ) : (
        <section>
          <ResultsClient initial={results} isAdmin={isAdmin} />
        </section>
      )}
    </div>
  );
}
