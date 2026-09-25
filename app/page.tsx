import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { Reveal } from '@/components/site/Reveal';
import { estimateReadMinutes } from '@/lib/content/markdown';
import { getPublishedCaseStudies, getPublishedPosts } from '@/lib/content/data';

export const metadata: Metadata = {
  title: 'ProbeTech | AI Automation, Chatbots & Custom Software',
  description: 'ProbeTech designs AI automations, chatbots, and custom software for growing businesses. Start with a free 30-minute discovery call.',
  openGraph: {
    title: 'ProbeTech | Systems that fix business problems',
    description: 'AI automations, chatbots, and custom software for growing businesses.',
    type: 'website',
  },
};

const services = [
  { title: 'AI Automation', description: "Take repetitive work off your team's plate.", href: '/services/ai-automation' },
  { title: 'AI Chatbots & Assistants', description: 'Answer customers and capture leads around the clock.', href: '/services/ai-chatbots' },
  { title: 'Custom Software', description: 'Platforms and dashboards built around how you actually work.', href: '/services/custom-software' },
];

const principles = [
  'Problem first, technology second. If a simple fix works, we’ll say so.',
  'Built to run unattended, with error handling and monitoring.',
  'You talk to the person building your system.',
];

export const revalidate = 300;

export default async function HomePage() {
  const [posts, work] = await Promise.all([getPublishedPosts(), getPublishedCaseStudies()]);
  return (
    <>
      <SiteHeader />
      <main className="public-site">
        <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-subtle">Web development and AI studio · Lagos, Nigeria</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Your business has problems. We build the systems that fix them.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-subtle">ProbeTech designs AI automations, chatbots, and custom software for growing businesses. We start by understanding the problem, not by selling a solution.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/book-a-call" className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80">Book a Discovery Call <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/how-we-work" className="rounded-xl border border-black/15 px-5 py-3.5 text-sm font-semibold transition hover:border-black">See how we work</Link>
            </div>
            <p className="mt-4 text-sm text-subtle">Free 30-minute call. No commitment.</p>
          </div>
        </section>

        <section className="border-y border-black/10 bg-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight">Most businesses lose hours every week to work a system should be doing.</h2>
            <p className="text-base leading-7 text-subtle">Answering the same customer questions. Copying data between tools. Chasing leads that went cold. Compiling reports by hand. None of it is hard. All of it is expensive. And most teams are too busy doing it to fix it.</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">What we build</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Three ways to make work easier.</h2>
            </div>
            <Link href="/services" className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">Explore services <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <Reveal className="grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <Link key={service.href} href={service.href} className="group rounded-2xl border border-black/10 p-6 transition hover:border-black/30">
                <h3 className="text-lg font-semibold tracking-tight">{service.title}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-subtle">{service.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </Reveal>
        </section>

        <section className="border-y border-black/10 bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">A clear process</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">How we work</h2>
            <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {['Discovery', 'Diagnosis', 'Build', 'Launch & Support'].map((stage, index) => <li key={stage} className="border-t border-black/15 pt-4"><span className="font-mono text-xs text-subtle">0{index + 1}</span><p className="mt-2 font-medium">{stage}</p></li>)}
            </ol>
            <Link href="/how-we-work" className="mt-7 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">See how we work <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:py-20 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Why ProbeTech</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built around your problem.</h2>
          </div>
          <ul className="divide-y divide-black/10">
            {principles.map((principle) => <li key={principle} className="py-4 text-base leading-7">{principle}</li>)}
          </ul>
        </section>

        {posts.length > 0 && <section className="border-y border-black/10 bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
          <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Blogs</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">What businesses are telling us</h2></div><Link href="/blogs" className="text-sm font-medium underline underline-offset-4">All blogs</Link></div>
            <div className="grid gap-4 md:grid-cols-3">{posts.slice(0, 3).map((post) => <Link key={post.id} href={`/blogs/${post.slug}`} className="rounded-2xl border border-black/10 bg-white p-5 transition hover:border-black/30"><p className="text-xs text-subtle">{post.category} · {estimateReadMinutes(post.body)} min read</p><h3 className="mt-3 text-lg font-semibold tracking-tight">{post.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-subtle">{post.excerpt}</p></Link>)}</div>
          </div>
        </section>}

        {work.length > 0 && <section className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
          <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Case Studies</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Featured work</h2></div><Link href="/case-studies" className="text-sm font-medium underline underline-offset-4">All case studies</Link></div>
          <div className="grid gap-4 md:grid-cols-2">{work.slice(0, 2).map((study) => <Link key={study.id} href={`/case-studies/${study.slug}`} className="rounded-2xl border border-black/10 p-6 transition hover:border-black/30"><p className="text-xs uppercase tracking-wide text-subtle">{study.service_type.replace(/_/g, ' ')}</p><h3 className="mt-2 text-xl font-semibold tracking-tight">{study.project_title}</h3><p className="mt-3 text-sm leading-6 text-subtle">{study.summary}</p></Link>)}</div>
        </section>}

        <section className="border-t border-black/10 bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center sm:py-20">
            <h2 className="text-3xl font-semibold tracking-tight">Tell us where it hurts.</h2>
            <Link href="/book-a-call" className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80">Book a Discovery Call <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
