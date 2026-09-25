import Link from 'next/link';

export function BrandLockup({ logoSrc = '/probetech-mark.svg', className = '' }: { logoSrc?: string; className?: string }) {
  return <Link href="/" aria-label="ProbeTech home" className={`group inline-flex items-center gap-2.5 text-black transition-opacity duration-200 ease-out hover:opacity-80 ${className}`}>
    <img src={logoSrc} alt="" aria-hidden="true" className="h-7 w-7 shrink-0 rounded-md" />
    <span className="text-lg font-[650] tracking-tight">ProbeTech</span>
  </Link>;
}
