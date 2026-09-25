import Link from 'next/link';
import { getPublishedCaseStudies, getPublishedPosts } from '@/lib/content/data';
import { BrandLockup } from '@/components/site/BrandLockup';

export async function SiteFooter() {
  const [posts, work] = await Promise.all([getPublishedPosts(), getPublishedCaseStudies()]);
  return (
    <footer className="site-footer border-t border-white/15 bg-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-7 px-6 py-10 sm:py-12">
        <BrandLockup tone="light" className="text-sm" />
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/75">
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/services" className="hover:text-white">Services</Link>
          <Link href="/how-we-work" className="hover:text-white">How We Work</Link>
          {work.length > 0 && <Link href="/case-studies" className="hover:text-white">Case Studies</Link>}
          {posts.length > 0 && <Link href="/blogs" className="hover:text-white">Blog</Link>}
          <Link href="/book-a-call" className="hover:text-white">Book a Discovery Call</Link>
          <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link>
        </nav>
        <p className="text-2xl font-semibold leading-tight tracking-tight sm:text-[1.75rem]">Systems that solve real business problems.</p>
        <p className="text-xs text-white/60">© 2026 ProbeTech. All rights reserved.</p>
      </div>
    </footer>
  );
}
