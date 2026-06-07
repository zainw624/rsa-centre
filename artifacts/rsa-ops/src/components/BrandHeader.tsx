import { Link } from 'wouter';

export function BrandHeader() {
  return (
    <header className="flex flex-col gap-6 rounded-3xl p-6 py-5 shadow-card sm:flex-row sm:items-center sm:justify-between card" style={{ border: '1px solid rgba(201,165,90,0.12)' }}>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#071018]" style={{ border: '1px solid rgba(201,165,90,0.12)' }}>
          <img src="/assets/rsa1.png" alt="RSA logo" className="object-contain w-full h-full" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-rsa-gold">RSA Operations Centre</p>
          <p className="text-base font-semibold text-white">Private Discord-authenticated platform</p>
        </div>
      </div>
      <nav className="flex flex-wrap gap-3 text-sm text-slate-300">
        <Link href="/" className="transition hover:text-white">Home</Link>
        <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
        <Link href="/login" className="transition hover:text-white">Login</Link>
      </nav>
    </header>
  );
}
