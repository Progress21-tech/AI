import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { absoluteSiteUrl, getPublishedCaseStudies } from '@/lib/content/data';
import { imageSourceAndAlt } from '@/lib/content/markdown';

export const revalidate = 300;
const serviceLabels = { automation: 'Automation', chatbot: 'Chatbot', custom_software: 'Custom software' };

export async function generateStaticParams() { return (await getPublishedCaseStudies()).map((study) => ({ slug: study.slug })); }

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const study = (await getPublishedCaseStudies()).find((item) => item.slug === params.slug);
  if (!study) return { title: 'Work example not found | ProbeTech', robots: { index: false, follow: false } };
  const canonical = absoluteSiteUrl(`/case-studies/${study.slug}`);
  const firstImage = study.screenshots[0] ? imageSourceAndAlt(study.screenshots[0], study.project_title).src : undefined;
  return {
    title: study.seo_title || `${study.project_title} | ProbeTech Work`,
    description: study.seo_description || study.summary,
    alternates: { canonical },
    openGraph: { type: 'article', title: study.seo_title || study.project_title, description: study.seo_description || study.summary, url: canonical, images: firstImage ? [{ url: firstImage, alt: study.project_title }] : undefined },
  };
}

export default async function WorkDetailPage({ params }: { params: { slug: string } }) {
  const study = (await getPublishedCaseStudies()).find((item) => item.slug === params.slug);
  if (!study) notFound();
  return <><SiteHeader /><main className="public-site mx-auto max-w-6xl px-6 py-14 sm:py-20">
    <article className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">{serviceLabels[study.service_type]}</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{study.project_title}</h1>
      {study.client_approved_public && study.client_name && <p className="mt-3 text-base text-subtle">For {study.client_name}</p>}
      <p className="mt-5 max-w-3xl text-lg leading-8 text-subtle">{study.summary}</p>
      {study.problem && <section className="mt-12 grid gap-4 border-t border-black/10 pt-8 sm:grid-cols-[12rem_1fr] sm:gap-8"><h2 className="text-xl font-semibold tracking-tight">The problem</h2><p className="whitespace-pre-line text-base leading-7 text-subtle">{study.problem}</p></section>}
      {study.solution && <section className="mt-10 grid gap-4 border-t border-black/10 pt-8 sm:grid-cols-[12rem_1fr] sm:gap-8"><h2 className="text-xl font-semibold tracking-tight">What we built</h2><p className="whitespace-pre-line text-base leading-7 text-subtle">{study.solution}</p></section>}
      {study.screenshots.length > 0 && <div className="mt-8 grid gap-4 sm:grid-cols-2">{study.screenshots.map((value) => { const image = imageSourceAndAlt(value, study.project_title); return <div key={value} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-black/10"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" className="object-cover" /></div>; })}</div>}
      {study.tech_used.length > 0 && <section className="mt-10 grid gap-4 border-t border-black/10 pt-8 sm:grid-cols-[12rem_1fr] sm:gap-8"><h2 className="text-xl font-semibold tracking-tight">Tech used</h2><p className="text-sm leading-7 text-subtle">{study.tech_used.join(' · ')}</p></section>}
      {study.result && <section className="mt-10 grid gap-4 border-t border-black/10 pt-8 sm:grid-cols-[12rem_1fr] sm:gap-8"><h2 className="text-xl font-semibold tracking-tight">The result</h2><p className="whitespace-pre-line text-base leading-7 text-subtle">{study.result}</p></section>}
      {study.testimonial_quote && <blockquote className="mt-10 border-l-2 border-black/20 pl-5"><p className="text-lg leading-8">“{study.testimonial_quote}”</p>{(study.testimonial_author || study.testimonial_role) && <footer className="mt-3 text-sm text-subtle">{[study.testimonial_author, study.testimonial_role].filter(Boolean).join(' · ')}</footer>}</blockquote>}
    </article>
    <section className="mx-auto mt-14 max-w-4xl rounded-2xl bg-surface p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8"><h2 className="text-xl font-semibold tracking-tight">Have a similar problem? Book a discovery call.</h2><Link href="/book-a-call" className="mt-5 inline-flex shrink-0 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white hover:bg-black/80 sm:mt-0">Book a Discovery Call</Link></section>
  </main><SiteFooter /></>;
}
