import Link from 'next/link';

export function BrandLockup({ logoSrc = '/probetech-mark.svg', className = '', tone = 'dark' }: { logoSrc?: string; className?: string; tone?: 'dark' | 'light' }) {
  const color = tone === 'light' ? 'text-white' : 'text-black';
  const logoTone = tone === 'light' ? 'brightness-0 invert' : '';
  return <Link href="/" aria-label="ProbeTech home" className={`group inline-flex items-center gap-2.5 ${color} font-bold transition-opacity duration-200 ease-out hover:opacity-80 motion-reduce:transition-none ${className}`}>
    <span aria-hidden="true" className="relative h-7 w-7 shrink-0 overflow-hidden">
      <img src={logoSrc} alt="" className={`absolute left-1/2 top-1/2 h-[58px] w-[58px] max-w-none -translate-x-1/2 -translate-y-1/2 ${logoTone}`} />
    </span>
    <span className={`text-lg font-bold tracking-tight ${color}`}>ProbeTech</span>
  </Link>;
}
