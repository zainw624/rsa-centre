import { getTransfers, getSettings } from '@/lib/db';
import TransfersClient from '@/components/TransfersClient';

export const dynamic = 'force-dynamic';
export default async function TransfersPage() {
  const transfers = await getTransfers(25);
  const settings = await getSettings();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Transfers</p>
        <h1 className="text-2xl font-semibold text-white">Recent transfers</h1>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-slate-400">Transfer Window</div>
          <div className="text-sm font-semibold text-white">{settings?.transferWindowOpen ? 'Open' : 'Closed'}</div>
        </div>
        <TransfersClient initial={transfers} />
      </section>
    </div>
  );
}
