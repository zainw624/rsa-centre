import { BrandHeader } from '../components/BrandHeader';

export default function LoginPage() {
  return (
    <main className="main-shell px-6 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <BrandHeader />

        <section className="card rounded-3xl p-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-rsa-gold">Private access only</p>
          <h1 className="mt-5 text-4xl font-semibold text-white">Login with Discord</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Access is restricted to RSA server members. Your Discord roles will determine what platform features are available.
          </p>

          <a
            href="/api/auth/signin/discord"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-rsa-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] transition hover:brightness-95"
            style={{ color: '#020617' }}
          >
            Login with Discord
          </a>
        </section>
      </div>
    </main>
  );
}
