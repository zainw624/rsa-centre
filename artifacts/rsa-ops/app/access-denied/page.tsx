import Link from 'next/link';
import { BrandHeader } from '@/components/BrandHeader';

export default function AccessDeniedPage() {
  return (
    <main className="main-shell px-6 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <BrandHeader />

        <section className="card rounded-3xl border border-rsa-border p-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-rsa-gold">Access Denied</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">RSA Server membership required</h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            You must be a member of the RSA Discord Server to access the RSA Operations Centre.
            Please login with a verified Discord account that belongs to the RSA server.
          </p>
          <Link href="/login" className="mt-10 inline-flex items-center justify-center rounded-full border border-rsa-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-rsa-gold transition hover:bg-rsa-gold/10">
            Return to login
          </Link>
        </section>
      </div>
    </main>
  );
}
