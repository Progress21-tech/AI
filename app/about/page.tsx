import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export const metadata: Metadata = {
  title: 'About ProbeTech | We solve real business problems',
  description: 'Learn the mission, vision, beliefs, and approach behind ProbeTech.',
  openGraph: {
    title: 'About ProbeTech | We solve real business problems',
    description: 'Learn the mission, vision, beliefs, and approach behind ProbeTech.',
    type: 'website',
  },
};

const beliefs = [
  { title: 'Problems come before technology.', text: "We don't start with a tool and look for a use for it. We start with what's actually slowing a business down." },
  { title: 'Reliable beats impressive.', text: 'A system that quietly works every day is worth more than one that looks advanced in a demo.' },
  { title: 'Simple is not the same as easy.', text: 'The best solution is often the simplest one that solves the whole problem, and finding it takes real work.' },
  { title: 'Honesty is part of the service.', text: "If a business doesn't need what we sell, we'll say so." },
];

const approach = [
  { title: 'Listen first.', text: 'Every engagement starts with a discovery call, not a pitch.' },
  { title: 'Diagnose before prescribing.', text: 'We map the actual problem before proposing a solution.' },
  { title: 'Build in the open.', text: 'We share working progress throughout, not just at the end.' },
  { title: 'Stay accountable after launch.', text: "Our job isn't done at delivery. It's done when the system is still working, unattended, weeks later." },
];

export default function AboutPage() {
  return <>
    <SiteHeader />
    <main className="public-site">
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">We exist to solve real business problems.</h1>
      </section>

      <section className="border-y border-black/10 bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-[12rem_1fr] sm:gap-10 sm:py-16">
          <h2 className="font-semibold tracking-tight">Mission</h2>
          <p className="max-w-3xl text-base leading-7 text-subtle">ProbeTech builds the systems businesses need but don't have time to build themselves. We turn repetitive, manual, and disconnected work into software that runs reliably, so teams can spend their time on what actually grows the business.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-[12rem_1fr] sm:gap-10 sm:py-16">
        <h2 className="font-semibold tracking-tight">Vision</h2>
        <p className="max-w-3xl text-base leading-7 text-subtle">A future where every growing business, not just large enterprises, has access to reliable automation and software built around how they actually work.</p>
      </section>

      <section className="border-y border-black/10 bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-[12rem_1fr] sm:gap-10 sm:py-16">
          <h2 className="font-semibold tracking-tight">What we believe</h2>
          <ul className="divide-y divide-black/10">
            {beliefs.map((belief) => <li key={belief.title} className="py-5 first:pt-0 last:pb-0 text-base leading-7 text-subtle"><strong className="font-semibold text-black">{belief.title}</strong> {belief.text}</li>)}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-[12rem_1fr] sm:gap-10 sm:py-16">
        <h2 className="font-semibold tracking-tight">Our philosophy</h2>
        <p className="max-w-3xl text-base leading-7 text-subtle">Most software fails not because the code is bad, but because it was built for the wrong problem. So we spend more time understanding the problem than writing the first line of code. Every system we build has to survive contact with the real world: messy data, unpredictable users, and things going wrong at 2am. We design for that from the start, not as an afterthought.</p>
      </section>

      <section className="border-y border-black/10 bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-[12rem_1fr] sm:gap-10 sm:py-16">
          <h2 className="font-semibold tracking-tight">Our approach</h2>
          <ul className="divide-y divide-black/10">
            {approach.map((item) => <li key={item.title} className="py-5 first:pt-0 last:pb-0 text-base leading-7 text-subtle"><strong className="font-semibold text-black">{item.title}</strong> {item.text}</li>)}
          </ul>
        </div>
      </section>

      <section className="border-t border-black/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-center sm:py-16">
          <h2 className="font-semibold tracking-tight">Have a problem worth solving? Book a discovery call.</h2>
          <Link href="/book-a-call" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-black/80 motion-reduce:transition-none">Book a Discovery Call <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
