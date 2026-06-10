import { getTransfers, getSettings } from '@/lib/db';
import TransfersClient from '@/components/TransfersClient';
import { BrandHeader } from '@/components/BrandHeader';
import { Replace } from 'lucide-react';

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

  const windowOpen = settings?.transferWindowOpen;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <BrandHeader
          title="Transfer Activity"
          subtitle="Player movements and transfer requests"
        />
        {!dbError && (
          <div className="shrink-0 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Transfer Window</span>
              <span className={`text-sm font-bold ${windowOpen ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                {windowOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${windowOpen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
              <Replace className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      {dbError ? (
        <div className="card-panel border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-base font-bold text-amber-500 font-display">Database not connected</p>
          <p className="mt-1 text-sm text-amber-500/80 font-medium">Set DATABASE_URL in Replit Secrets to view transfer data</p>
        </div>
      ) : (
        <section>
          <TransfersClient initial={transfers} />
        </section>
      )}
    </div>
  );
}
