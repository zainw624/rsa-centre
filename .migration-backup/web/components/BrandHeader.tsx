import Image from 'next/image';
import Link from 'next/link';

export function BrandHeader() {
  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-rsa-border bg-white/5 px-6 py-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-rsa-border bg-[#071018]">
          <Image src="/assets/rsa1.png" alt="RSA logo" fill sizes="64px" className="object-contain" />
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
