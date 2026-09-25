import Link from 'next/link';

export function BrandLockup({ logoSrc = '/probetech-mark.svg', className = '', tone = 'dark' }: { logoSrc?: string; className?: string; tone?: 'dark' | 'light' }) {
  const color = tone === 'light' ? 'text-white' : 'text-black';
  return <Link href="/" aria-label="ProbeTech home" className={`group inline-flex items-center gap-2.5 ${color} font-[650] transition-opacity duration-200 ease-out hover:opacity-80 motion-reduce:transition-none ${className}`}>
    <img src={logoSrc} alt="" aria-hidden="true" className="h-7 w-7 shrink-0 rounded-md" />
    <span className={`text-lg font-[650] tracking-tight ${color}`}>ProbeTech</span>
  </Link>;
}
