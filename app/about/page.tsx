import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export const metadata: Metadata = {
  title: 'About | ProbeTech',
  description: 'Meet Progress Oni and learn the principles behind ProbeTech.',
  openGraph: { title: 'About | ProbeTech', description: 'Built by someone who builds.', type: 'website' },
};

const principles = ['Problem first, technology second.', 'Reliable beats impressive.', 'Honest about what we can and can’t do.'];

export default function AboutPage() {
  return <><SiteHeader /><main>
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">About ProbeTech</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Built by someone who builds.</h1>
        <p className="mt-5 text-lg leading-8 text-subtle">ProbeTech started from a simple observation: most business problems are process problems, and process problems can be solved with well-built systems.</p>
      </div>
    </section>
    <section className="border-y border-black/10 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 sm:grid-cols-[12rem_1fr] sm:gap-8 sm:py-14">
        <h2 className="text-xl font-semibold tracking-tight">The person behind ProbeTech</h2>
        <div className="max-w-3xl space-y-5 text-base leading-7 text-subtle">
          <p>I’m Progress Oni, a developer and founder based in Lagos. I’ve built [client sites and platforms, including EventFlow’s custom CMS], and I’m also building MediConnect, a health data interoperability platform, which has taught me how to make messy systems talk to each other.</p>
          <nav aria-label="Progress Oni profiles" className="flex flex-wrap gap-5 text-sm text-black">
            <a href="https://github.com/Progress21-tech" target="_blank" rel="noreferrer" className="underline underline-offset-4">GitHub</a>
            <a href="https://linkedin.com/in/progressoni" target="_blank" rel="noreferrer" className="underline underline-offset-4">LinkedIn</a>
          </nav>
        </div>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:py-16 md:grid-cols-2">
      <h2 className="text-2xl font-semibold tracking-tight">Principles</h2>
      <ul className="divide-y divide-black/10">{principles.map((principle) => <li key={principle} className="py-4 text-base leading-7">{principle}</li>)}</ul>
    </section>
    <section className="border-t border-black/10 bg-surface"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-center sm:py-16"><h2 className="text-2xl font-semibold tracking-tight">Tell us where it hurts.</h2><Link href="/book-a-call" className="inline-flex min-h-11 items-center rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-black/80">Book a Discovery Call</Link></div></section>
  </main><SiteFooter /></>;
}
