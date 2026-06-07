import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prismaClient';
import ResultsClient from '@/components/ResultsClient';

export const dynamic = 'force-dynamic';
export default async function ResultsPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  const results = await prisma.result.findMany({ orderBy: { matchDate: 'desc' } });

  const isAdmin = !!(session && session.user && (session.user.permission === 'owner' || (session.user.roles || []).includes('RSA | Officials') || process.env.BOT_OWNER_ID === session.user.discordId));

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Results</p>
        <h1 className="text-2xl font-semibold text-white">Match results</h1>
      </header>

      <section>
        <ResultsClient initial={results} isAdmin={isAdmin} />
      </section>
    </div>
  );
}
