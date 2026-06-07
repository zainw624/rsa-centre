export default function StatusCard({ title, status, hint }: { title: string; status: string; hint?: string }) {
  const isGood = status === 'Open' || status === 'Healthy' || status === 'Active' || status === 'Configured';
  return (
    <div className="card rounded-2xl p-4">
      <p className="text-xs uppercase tracking-widest text-rsa-gold">{title}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-white">{status}</div>
        <div className={`rounded-full px-3 py-1 text-sm font-medium ${isGood ? 'text-green-300' : 'text-red-300'}`} style={{ background: isGood ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)' }}>
          {isGood ? 'Good' : 'Attention'}
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
