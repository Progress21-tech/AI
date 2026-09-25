import Link from 'next/link';
import { getPublishedCaseStudies, getPublishedPosts } from '@/lib/content/data';

export async function SiteHeader({ logoSrc }: { logoSrc?: string }) {
  const [posts, work] = await Promise.all([getPublishedPosts(), getPublishedCaseStudies()]);
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <Link href="/" aria-label="ProbeTech home" className="inline-flex items-center text-lg font-semibold tracking-tight">
          {logoSrc ? <img src={logoSrc} alt="ProbeTech" className="h-8 w-auto" /> : 'ProbeTech'}
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm">
          <Link className="hidden text-subtle transition hover:text-black sm:inline" href="/services">Services</Link>
          <Link className="hidden text-subtle transition hover:text-black sm:inline" href="/how-we-work">How We Work</Link>
          {work.length > 0 && <Link className="hidden text-subtle transition hover:text-black md:inline" href="/work">Work</Link>}
          {posts.length > 0 && <Link className="hidden text-subtle transition hover:text-black md:inline" href="/insights">Insights</Link>}
          <Link href="/book-a-call" className="rounded-xl bg-black px-4 py-2.5 font-medium text-white transition hover:bg-black/80">
            Book a Discovery Call
          </Link>
        </nav>
      </div>
    </header>
  );
}
