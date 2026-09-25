import Link from 'next/link';
import { getPublishedCaseStudies, getPublishedPosts } from '@/lib/content/data';
import { BrandLockup } from '@/components/site/BrandLockup';

export async function SiteFooter() {
  const [posts, work] = await Promise.all([getPublishedPosts(), getPublishedCaseStudies()]);
  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-7 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
        <BrandLockup className="text-sm" />
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/services" className="hover:text-black">Services</Link>
          <Link href="/how-we-work" className="hover:text-black">How We Work</Link>
          {work.length > 0 && <Link href="/work" className="hover:text-black">Work</Link>}
          {posts.length > 0 && <Link href="/insights" className="hover:text-black">Insights</Link>}
          <Link href="/book-a-call" className="hover:text-black">Book a Discovery Call</Link>
        </nav>
      </div>
    </footer>
  );
}
