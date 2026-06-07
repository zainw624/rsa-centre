import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="login-shell">
      {/* Top header bar */}
      <header className="login-header">
        <div className="login-header-inner">
          <div className="login-brand">
            <div className="login-logo-wrap">
              <Image
                src="/assets/rsa1.png"
                alt="RSA logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="login-brand-name">RSA Operations Centre</p>
              <p className="login-brand-sub">Private Discord-authenticated platform</p>
            </div>
          </div>
          <div className="login-header-right">
            <span className="login-not-signed">Not signed in</span>
            <Link href="/api/auth/signin/discord" className="login-header-btn">
              <DiscordIcon />
              Login with Discord
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="login-main">
        <div className="login-hero">
          {/* Badge */}
          <div className="login-badge">
            <span className="login-badge-dot" />
            PRIVATE LEAGUE — RSA MEMBERS ONLY
          </div>

          {/* Logo */}
          <div className="login-hero-logo">
            <Image
              src="/assets/rsa1.png"
              alt="RSA"
              fill
              sizes="120px"
              className="object-contain"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="login-title">
            RSA Management
            <br />
            <span className="login-title-accent">Platform</span>
          </h1>

          <p className="login-subtitle">
            The official private management platform for RSA staff, players, and officials.
            Your Discord roles automatically determine your access level.
          </p>

          {/* Access requirement cards */}
          <div className="login-requirements">
            <div className="login-req-card">
              <div className="login-req-icon">
                <DiscordServerIcon />
              </div>
              <div>
                <p className="login-req-title">In the RSA Discord</p>
                <p className="login-req-desc">Active member of the RSA Discord server</p>
              </div>
            </div>
            <div className="login-req-card">
              <div className="login-req-icon login-req-icon--gold">
                <ShieldCheckIcon />
              </div>
              <div>
                <p className="login-req-title">RSA Verified</p>
                <p className="login-req-desc">Verified RSA role assigned in the server</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link href="/api/auth/signin/discord" className="login-cta-btn">
            <DiscordIcon size={22} />
            Sign in with Discord
          </Link>

          <p className="login-redirect-note">
            You will be redirected to Discord to confirm your identity. No password required.
          </p>
        </div>
      </main>

      <style>{`
        .login-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(ellipse 80% 40% at 50% -10%, rgba(201,165,90,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 30% at 80% 80%, rgba(88,101,242,0.06) 0%, transparent 60%),
            linear-gradient(180deg, #080c14 0%, #090d17 50%, #08101a 100%);
        }

        /* Header */
        .login-header {
          border-bottom: 1px solid rgba(201,165,90,0.10);
          background: rgba(8,12,20,0.80);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .login-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .login-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .login-logo-wrap {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(201,165,90,0.20);
          background: #071018;
          flex-shrink: 0;
        }
        .login-brand-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #f8f8f4;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }
        .login-brand-sub {
          font-size: 0.7rem;
          color: #64748b;
          line-height: 1.2;
        }
        .login-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .login-not-signed {
          font-size: 0.8rem;
          color: #64748b;
          white-space: nowrap;
        }
        .login-header-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #5865F2;
          color: #fff;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.45rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s, opacity 0.15s;
          white-space: nowrap;
        }
        .login-header-btn:hover { background: #4752c4; }

        /* Main hero */
        .login-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem 4rem;
        }
        .login-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 560px;
          width: 100%;
          gap: 0;
        }

        /* Badge */
        .login-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(201,165,90,0.08);
          border: 1px solid rgba(201,165,90,0.22);
          border-radius: 999px;
          padding: 0.35rem 1rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #c9a55a;
          text-transform: uppercase;
          margin-bottom: 2rem;
        }
        .login-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a55a;
          animation: pulse-gold 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes pulse-gold {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Hero logo */
        .login-hero-logo {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(201,165,90,0.18);
          background: rgba(12,19,30,0.9);
          box-shadow: 0 0 40px rgba(201,165,90,0.10), 0 16px 40px rgba(0,0,0,0.4);
          margin-bottom: 2rem;
        }

        /* Title */
        .login-title {
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          font-weight: 700;
          color: #f8f8f4;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 1.25rem;
        }
        .login-title-accent {
          color: #c9a55a;
        }

        /* Subtitle */
        .login-subtitle {
          font-size: 1rem;
          color: #94a3b8;
          line-height: 1.7;
          max-width: 420px;
          margin: 0 0 2.5rem;
        }

        /* Requirement cards */
        .login-requirements {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          width: 100%;
          margin-bottom: 2.5rem;
        }
        @media (max-width: 480px) {
          .login-requirements { grid-template-columns: 1fr; }
        }
        .login-req-card {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: rgba(18,27,38,0.7);
          border: 1px solid rgba(201,165,90,0.10);
          border-radius: 16px;
          padding: 1rem 1.25rem;
          text-align: left;
          transition: border-color 0.2s;
        }
        .login-req-card:hover { border-color: rgba(201,165,90,0.25); }
        .login-req-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(88,101,242,0.12);
          border: 1px solid rgba(88,101,242,0.20);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #5865F2;
        }
        .login-req-icon--gold {
          background: rgba(201,165,90,0.10);
          border-color: rgba(201,165,90,0.20);
          color: #c9a55a;
        }
        .login-req-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #f8f8f4;
          margin: 0 0 0.2rem;
        }
        .login-req-desc {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.4;
          margin: 0;
        }

        /* CTA button */
        .login-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          background: #5865F2;
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          padding: 1rem 2.5rem;
          border-radius: 14px;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 24px rgba(88,101,242,0.35);
          letter-spacing: 0.01em;
          width: 100%;
          max-width: 360px;
          margin-bottom: 1rem;
        }
        .login-cta-btn:hover {
          background: #4752c4;
          box-shadow: 0 8px 32px rgba(88,101,242,0.45);
          transform: translateY(-1px);
        }
        .login-cta-btn:active { transform: translateY(0); }

        .login-redirect-note {
          font-size: 0.75rem;
          color: #475569;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function DiscordServerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}
