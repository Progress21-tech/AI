import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export const metadata: Metadata = {
  title: 'How We Work | ProbeTech',
  description: 'A clear four-stage process for discovering, diagnosing, building, and supporting the right system for your business.',
  openGraph: { title: 'How We Work | ProbeTech', description: 'Clear steps. No surprises.', type: 'website' },
};

const stages = [
  {
    number: '01', title: 'Discovery Call (free, 30 minutes)',
    description: 'We ask how your business runs, where time is lost, and what you’ve already tried. We listen first. Whether we’re the right fit comes second.',
    outcome: 'Clarity on your problem and an honest view of whether we can help.',
  },
  {
    number: '02', title: 'Diagnosis and Proposal',
    description: 'We map the problem, decide what’s worth building, and send a written proposal with scope, timeline, and fixed price.',
    outcome: 'A document you can approve, adjust, or take elsewhere.',
  },
  {
    number: '03', title: 'Build',
    description: 'We build in short cycles and share working progress regularly. You review, we adjust.',
    outcome: 'Regular updates and no surprises at the end.',
  },
  {
    number: '04', title: 'Launch and Support',
    description: 'We deploy, train your team, and stay available afterward.',
    outcome: 'A system that works on day one and a support period after.',
  },
];

export default function HowWeWorkPage() {
  return (
    <>
      <SiteHeader />
      <main className="public-site">
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">How we work</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Clear steps. No surprises.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-subtle">Every project follows the same four stages, so you always know where you stand.</p>
        </section>

        <ol className="mx-auto max-w-6xl divide-y divide-black/10 border-y border-black/10 px-6">
          {stages.map((stage) => (
            <li key={stage.number} className="grid gap-5 py-8 sm:grid-cols-[4rem_1fr_1fr] sm:gap-8 sm:py-10">
              <span className="font-mono text-xs text-subtle">{stage.number}</span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{stage.title}</h2>
                <p className="mt-3 text-sm leading-7 text-subtle">{stage.description}</p>
              </div>
              <p className="self-start rounded-xl bg-surface p-5 text-sm leading-6"><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-subtle">You’ll get</span>{stage.outcome}</p>
            </li>
          ))}
        </ol>

        <section className="mx-auto grid max-w-6xl gap-5 px-6 py-12 sm:grid-cols-[12rem_1fr] sm:gap-8 sm:py-14">
          <h2 className="text-xl font-semibold tracking-tight">Working together</h2>
          <p className="text-base leading-7 text-subtle">[communication channel, check-in cadence, payment terms: FILL IN]</p>
        </section>

        <section className="border-t border-black/10 bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-center sm:py-16">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Start with the problem.</h2>
              <p className="mt-2 text-sm text-subtle">The first call is free, takes 30 minutes, and comes with no commitment.</p>
            </div>
            <Link href="/book-a-call" className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80">Book a Discovery Call <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
