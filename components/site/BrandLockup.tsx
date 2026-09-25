import Link from 'next/link';

export function BrandLockup({ logoSrc = '/probetech-mark-lockup.svg', className = '', tone = 'dark' }: { logoSrc?: string; className?: string; tone?: 'dark' | 'light' }) {
  const color = tone === 'light' ? 'text-white' : 'text-black';
  const logoTone = tone === 'light' ? 'brightness-0 invert' : '';
  return <Link href="/" aria-label="ProbeTech home" className={`group inline-flex items-center gap-2.5 ${color} font-bold transition-opacity duration-200 ease-out hover:opacity-80 motion-reduce:transition-none ${className}`}>
    <img src={logoSrc} alt="" aria-hidden="true" className={`h-7 w-7 shrink-0 ${logoTone}`} />
    <span className={`text-lg font-bold tracking-tight ${color}`}>ProbeTech</span>
  </Link>;
}
