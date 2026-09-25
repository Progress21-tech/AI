import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { estimateReadMinutes, imageSourceAndAlt } from '@/lib/content/markdown';
import { getPublishedPosts } from '@/lib/content/data';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Blogs | ProbeTech',
  description: 'Findings and practical advice drawn from real conversations with business owners.',
  alternates: { canonical: '/blogs', types: { 'application/rss+xml': '/blogs/rss.xml' } },
  openGraph: { title: 'Blogs | ProbeTech', description: 'Findings and practical advice drawn from real conversations with business owners.', type: 'website' },
};

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : '';

export default async function BlogsPage({ searchParams }: { searchParams: { category?: string; page?: string } }) {
  const allPosts = await getPublishedPosts();
  if (!allPosts.length) notFound();
  const categories = [...new Set(allPosts.map((post) => post.category))].sort();
  const category = categories.includes(searchParams.category ?? '') ? searchParams.category! : '';
  const matching = category ? allPosts.filter((post) => post.category === category) : allPosts;
  const page = Math.max(1, Number.parseInt(searchParams.page ?? '1', 10) || 1);
  const pageSize = 12;
  const pageCount = Math.ceil(matching.length / pageSize);
  const visiblePosts = matching.slice((page - 1) * pageSize, page * pageSize);
  return <><SiteHeader /><main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
    <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Blogs</p><h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">What businesses are telling us</h1><p className="mt-5 text-lg leading-8 text-subtle">Findings and practical advice drawn from real conversations with business owners.</p></div>
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-subtle">{matching.length} {matching.length === 1 ? 'article' : 'articles'}{category ? ` in ${category}` : ''}</p><form method="get" className="flex items-center gap-2"><label htmlFor="category" className="text-sm text-subtle">Filter by category</label><select id="category" name="category" defaultValue={category} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><button className="rounded-lg border border-black/15 px-3 py-2 text-sm">Apply</button></form></div>
    {visiblePosts.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visiblePosts.map((post) => { const image = post.cover_image_url ? imageSourceAndAlt(post.cover_image_url, post.title) : null; return <article key={post.id} className="overflow-hidden rounded-2xl border border-black/10 transition hover:border-black/30">{image && <div className="relative aspect-[16/9]"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" loading="lazy" className="object-cover" /></div>}<Link href={`/blogs/${post.slug}`} className="block p-5"><p className="text-xs text-subtle">{post.category} · {formatDate(post.published_at)} · {estimateReadMinutes(post.body)} min read</p><h2 className="mt-3 text-xl font-semibold tracking-tight">{post.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-subtle">{post.excerpt}</p></Link></article>; })}</div> : <p className="mt-8 text-sm text-subtle">No published articles in this category yet.</p>}
    {pageCount > 1 && <nav aria-label="Article pages" className="mt-10 flex items-center justify-center gap-3 text-sm">{page > 1 && <Link href={`/blogs?${new URLSearchParams({ ...(category ? { category } : {}), page: String(page - 1) })}`} className="rounded-lg border border-black/15 px-4 py-2">Previous</Link>}<span className="text-subtle">Page {page} of {pageCount}</span>{page < pageCount && <Link href={`/blogs?${new URLSearchParams({ ...(category ? { category } : {}), page: String(page + 1) })}`} className="rounded-lg border border-black/15 px-4 py-2">Next</Link>}</nav>}
  </main><SiteFooter /></>;
}
