import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { estimateReadMinutes, imageSourceAndAlt, MarkdownContent } from '@/lib/content/markdown';
import { absoluteSiteUrl, getPublishedPosts } from '@/lib/content/data';

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = (await getPublishedPosts()).find((item) => item.slug === params.slug);
  if (!post) return { title: 'Article not found | ProbeTech', robots: { index: false, follow: false } };
  const canonical = absoluteSiteUrl(`/blogs/${post.slug}`);
  const image = post.cover_image_url ? imageSourceAndAlt(post.cover_image_url, post.title).src : undefined;
  return {
    title: post.seo_title || `${post.title} | ProbeTech`,
    description: post.seo_description || post.excerpt,
    alternates: { canonical },
    openGraph: { type: 'article', title: post.seo_title || post.title, description: post.seo_description || post.excerpt, url: canonical, publishedTime: post.published_at ?? undefined, authors: [post.author], images: image ? [{ url: image, alt: post.title }] : undefined },
  };
}

const dateLabel = (value: string | null) => value ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : '';
const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export default async function InsightArticlePage({ params }: { params: { slug: string } }) {
  const posts = await getPublishedPosts();
  const post = posts.find((item) => item.slug === params.slug);
  if (!post) notFound();
  const related = posts.filter((item) => item.id !== post.id && item.category === post.category).slice(0, 3);
  const headings = [...post.body.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => ({ title: match[1], id: match[1].toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') }));
  const toc = post.body.length > 1800 && headings.length >= 3 ? headings : [];
  const canonical = absoluteSiteUrl(`/blogs/${post.slug}`);
  const image = post.cover_image_url ? imageSourceAndAlt(post.cover_image_url, post.title) : null;
  const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.seo_description || post.excerpt, datePublished: post.published_at, dateModified: post.updated_at, author: { '@type': 'Person', name: post.author }, mainEntityOfPage: canonical, image: image?.src };
  return <><SiteHeader /><main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    <article className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">{post.category}</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
      <p className="mt-5 text-lg leading-8 text-subtle">{post.excerpt}</p>
      <p className="mt-4 text-sm text-subtle">{post.author} · {dateLabel(post.published_at)} · {estimateReadMinutes(post.body)} min read</p>
      {image && <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 768px" priority className="object-cover" /></div>}
      {toc.length > 0 && <nav aria-label="Table of contents" className="mt-8 rounded-xl bg-surface p-5"><h2 className="text-sm font-semibold">In this article</h2><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">{toc.map((item) => <li key={item.id}><a href={`#${item.id}`} className="underline underline-offset-4">{item.title}</a></li>)}</ol></nav>}
      <MarkdownContent source={post.body} className="prose-content mt-8" />
    </article>
    {related.length > 0 && <section className="mx-auto mt-14 max-w-4xl border-t border-black/10 pt-10"><h2 className="text-2xl font-semibold tracking-tight">More in {post.category}</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{related.map((item) => <Link key={item.id} href={`/blogs/${item.slug}`} className="rounded-xl border border-black/10 p-5 hover:border-black/30"><p className="text-xs text-subtle">{estimateReadMinutes(item.body)} min read</p><h3 className="mt-2 font-semibold">{item.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-subtle">{item.excerpt}</p></Link>)}</div></section>}
    <section className="mx-auto mt-14 max-w-4xl rounded-2xl bg-surface p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8"><h2 className="text-xl font-semibold tracking-tight">Struggling with a problem like this? Book a free discovery call.</h2><Link href="/book-a-call" className="mt-5 inline-flex shrink-0 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white hover:bg-black/80 sm:mt-0">Book a Discovery Call</Link></section>
  </main><SiteFooter /></>;
}
