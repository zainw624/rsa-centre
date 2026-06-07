import Image from 'next/image';
import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#080c14 0%,#08101a 100%)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(201,165,90,0.10)', background: 'rgba(8,12,20,0.80)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(201,165,90,0.20)', background: '#071018', flexShrink: 0 }}>
              <Image src="/assets/rsa1.png" alt="RSA" fill sizes="40px" className="object-contain" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8f8f4', margin: 0, lineHeight: 1.2 }}>RSA Operations Centre</p>
              <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, lineHeight: 1.2 }}>Private Discord-authenticated platform</p>
            </div>
          </div>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(201,165,90,0.10)', color: '#c9a55a', border: '1px solid rgba(201,165,90,0.25)', fontSize: '0.8rem', fontWeight: 600, padding: '0.45rem 1rem', borderRadius: 8, textDecoration: 'none' }}>
            Return to Login
          </Link>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 480, width: '100%', gap: 0 }}>
          {/* Icon */}
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 999, padding: '0.3rem 0.9rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', color: '#ef4444', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            ACCESS DENIED
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700, color: '#f8f8f4', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 1rem' }}>
            RSA Server membership required
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.7, maxWidth: 400, margin: '0 0 2rem' }}>
            You must be an active member of the RSA Discord server to access the RSA Operations Centre.
            Please sign in with a Discord account that belongs to the RSA server.
          </p>

          {/* Requirement hints */}
          <div style={{ width: '100%', display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(18,27,38,0.7)', border: '1px solid rgba(201,165,90,0.10)', borderRadius: 12, padding: '0.875rem 1rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a55a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Join the RSA Discord server and obtain the required verified role</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(18,27,38,0.7)', border: '1px solid rgba(201,165,90,0.10)', borderRadius: 12, padding: '0.875rem 1rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a55a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Then sign in again — your roles are checked automatically at login</span>
            </div>
          </div>

          <Link
            href="/login"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#5865F2', color: '#fff', fontSize: '0.95rem', fontWeight: 700, padding: '0.875rem 2rem', borderRadius: 12, textDecoration: 'none', transition: 'background 0.15s', boxShadow: '0 4px 20px rgba(88,101,242,0.30)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Sign in with a different account
          </Link>
        </div>
      </main>
    </div>
  );
}
