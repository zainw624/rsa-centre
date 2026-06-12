"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Replace, Loader2 } from 'lucide-react';

export default function TransferWindowToggle({ initialOpen }: { initialOpen: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(!!initialOpen);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setBusy(true);
    setError(null);
    const next = !open;
    try {
      const res = await fetch('/api/transfer-window', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ open: next }),
      });
      if (!res.ok) {
        setError(res.status === 403 ? 'Not allowed.' : 'Could not update. Try again.');
        return;
      }
      const data = await res.json().catch(() => ({}));
      setOpen(!!data.transferWindowOpen);
      router.refresh();
    } catch {
      setError('Could not update. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={busy}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-60 ${
          open
            ? 'bg-muted text-muted-foreground hover:bg-muted/80'
            : 'bg-emerald-500 text-white hover:bg-emerald-600'
        }`}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Replace className="w-4 h-4" />}
        {open ? 'Close Transfer Window' : 'Open Transfer Window'}
      </button>
      {error && <span className="text-xs font-semibold text-destructive">{error}</span>}
    </div>
  );
}
