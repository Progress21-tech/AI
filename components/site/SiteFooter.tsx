import Link from 'next/link';
import { getPublishedCaseStudies, getPublishedPosts } from '@/lib/content/data';
import { BrandLockup } from '@/components/site/BrandLockup';

export async function SiteFooter() {
  const [posts, work] = await Promise.all([getPublishedPosts(), getPublishedCaseStudies()]);
  return (
    <footer className="site-footer border-t border-white/15 bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <div className="grid gap-9 lg:grid-cols-[minmax(13rem,1fr)_minmax(28rem,auto)] lg:items-start">
          <BrandLockup tone="light" className="text-sm" />
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm text-white/75 sm:gap-x-12">
            <div className="flex flex-col items-start gap-3">
              <Link href="/about" className="hover:text-white">About</Link>
              <Link href="/services" className="hover:text-white">Services</Link>
              <Link href="/how-we-work" className="hover:text-white">How We Work</Link>
            </div>
            <div className="flex flex-col items-start gap-3">
              {work.length > 0 && <Link href="/case-studies" className="hover:text-white">Case Studies</Link>}
              {posts.length > 0 && <Link href="/blogs" className="hover:text-white">Blog</Link>}
              <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link>
            </div>
            <Link href="/book-a-call" className="col-span-2 justify-self-start rounded-lg bg-white px-4 py-3 font-semibold text-black transition-colors duration-200 hover:bg-white/85 motion-reduce:transition-none">Book a Discovery Call</Link>
          </nav>
        </div>
        <p className="mt-12 w-full text-[clamp(2.5rem,5.2vw,4rem)] font-semibold leading-[1.02] tracking-tight">Systems that solve real business problems.</p>
        <p className="mt-8 text-center text-xs text-white/60">© 2026 ProbeTech. All rights reserved.</p>
      </div>
    </footer>
  );
}
