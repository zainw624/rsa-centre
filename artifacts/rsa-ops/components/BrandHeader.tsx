import Image from 'next/image';

export function BrandHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <header className="bh-wrap">
      <div className="bh-left">
        <div className="bh-logo">
          <Image src="/assets/rsa1.png" alt="RSA logo" fill sizes="56px" className="object-contain" priority />
        </div>
        <div>
          <p className="bh-eyebrow">RSA Operations Centre</p>
          <p className="bh-title">{title ?? 'Dashboard'}</p>
          {subtitle && <p className="bh-sub">{subtitle}</p>}
        </div>
      </div>

      <style>{`
        .bh-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 16px;
          border: 1px solid rgba(201,165,90,0.12);
          background: linear-gradient(135deg, rgba(12,17,28,0.9) 0%, rgba(8,12,20,0.9) 100%);
          padding: 1.1rem 1.25rem;
          gap: 1rem;
        }
        .bh-left {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }
        .bh-logo {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(201,165,90,0.20);
          background: #060d18;
          flex-shrink: 0;
        }
        .bh-eyebrow {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #c9a55a;
          margin: 0 0 0.2rem;
        }
        .bh-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
          line-height: 1.2;
        }
        .bh-sub {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0.2rem 0 0;
        }
      `}</style>
    </header>
  );
}
