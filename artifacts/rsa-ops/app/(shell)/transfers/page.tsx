import { getTransfers, getSettings } from '@/lib/db';
import TransfersClient from '@/components/TransfersClient';

export const dynamic = 'force-dynamic';

export default async function TransfersPage() {
  let transfers: any[] = [];
  let settings: any = null;
  let dbError = false;

  try {
    [transfers, settings] = await Promise.all([getTransfers(25), getSettings()]);
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rsa-gold">Transfers</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Transfer Activity</h1>
        <p className="mt-1 text-sm text-slate-500">Player movements and transfer requests</p>
      </header>

      {dbError ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-amber-300">Database not connected</p>
          <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view transfer data</p>
        </div>
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-rsa-border bg-white/3 px-4 py-3">
            <span className="text-sm text-slate-400">Transfer Window</span>
            <span className={`text-sm font-semibold ${settings?.transferWindowOpen ? 'text-green-400' : 'text-slate-400'}`}>
              {settings?.transferWindowOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <TransfersClient initial={transfers} />
        </section>
      )}
    </div>
  );
}
