import Image from 'next/image';

export function BrandHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-primary/20 bg-background/50 flex items-center justify-center shrink-0 shadow-inner">
          <Image src="/assets/rsa1.png" alt="RSA logo" fill sizes="56px" className="object-contain p-2" priority />
        </div>
        <div>
          <p className="text-[0.65rem] sm:text-xs font-bold tracking-[0.2em] uppercase text-primary mb-1">
            RSA Operations Centre
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-display leading-none">
            {title ?? 'Dashboard'}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
