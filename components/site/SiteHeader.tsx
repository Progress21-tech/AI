import { getPublishedCaseStudies, getPublishedPosts } from '@/lib/content/data';
import { BrandLockup } from '@/components/site/BrandLockup';
import { SiteNavigation } from '@/components/site/SiteNavigation';

export async function SiteHeader({ logoSrc }: { logoSrc?: string }) {
  const [posts, work] = await Promise.all([getPublishedPosts(), getPublishedCaseStudies()]);
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <BrandLockup logoSrc={logoSrc} />
        <SiteNavigation hasCaseStudies={work.length > 0} hasBlogs={posts.length > 0} />
      </div>
    </header>
  );
}
