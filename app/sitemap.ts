import type { MetadataRoute } from 'next';
import { absoluteSiteUrl, getPublishedCaseStudies, getPublishedPosts } from '@/lib/content/data';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, work] = await Promise.all([getPublishedPosts(), getPublishedCaseStudies()]);
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteSiteUrl('/'), changeFrequency: 'monthly', priority: 1 },
    { url: absoluteSiteUrl('/services'), changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteSiteUrl('/services/ai-automation'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteSiteUrl('/services/ai-chatbots'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteSiteUrl('/services/custom-software'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteSiteUrl('/how-we-work'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteSiteUrl('/about'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteSiteUrl('/book-a-call'), changeFrequency: 'monthly', priority: 0.9 },
  ];
  if (posts.length) pages.push({ url: absoluteSiteUrl('/blogs'), changeFrequency: 'weekly', priority: 0.7 });
  if (work.length) pages.push({ url: absoluteSiteUrl('/case-studies'), changeFrequency: 'monthly', priority: 0.7 });
  pages.push(...posts.map((post) => ({ url: absoluteSiteUrl(`/blogs/${post.slug}`), lastModified: new Date(post.updated_at), changeFrequency: 'monthly' as const, priority: 0.6 })));
  pages.push(...work.map((study) => ({ url: absoluteSiteUrl(`/case-studies/${study.slug}`), lastModified: new Date(study.updated_at), changeFrequency: 'monthly' as const, priority: 0.6 })));
  return pages;
}
