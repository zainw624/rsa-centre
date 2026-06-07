import { Link } from 'wouter';
import { BrandHeader } from '../components/BrandHeader';

export default function HomePage() {
  return (
    <main className="main-shell px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <BrandHeader />

        <section className="card rounded-3xl p-10">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-rsa-gold">RSA Operations Centre</p>
              <h1 className="text-4xl font-semibold text-white">Secure league management, built for RSA.</h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300">
                Private access for RSA staff with Discord login and role-based permissions. The web platform syncs to Discord commands and presents a unified operations dashboard.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/login"
                className="rounded-2xl px-5 py-4 text-left transition hover:bg-white/10"
                style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(255,255,255,0.05)' }}
              >
                <p className="text-xl font-semibold text-white">Login with Discord</p>
                <p className="mt-2 text-sm text-slate-300">Authenticate through Discord and verify membership in the RSA server.</p>
              </Link>

              <Link
                href="/dashboard"
                className="rounded-2xl px-5 py-4 text-left transition hover:bg-white/10"
                style={{ border: '1px solid rgba(201,165,90,0.12)', background: 'rgba(255,255,255,0.05)' }}
              >
                <p className="text-xl font-semibold text-white">Staff Dashboard</p>
                <p className="mt-2 text-sm text-slate-300">Protected operations centre access for staff, managers, and executives.</p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
