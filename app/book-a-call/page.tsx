import type { Metadata } from 'next';
import { BookCallForm } from '@/components/site/BookCallForm';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export const metadata: Metadata = {
  title: 'Book a Discovery Call | ProbeTech',
  description: 'Tell ProbeTech what is slowing your business down. Request a free 30-minute discovery call; we’ll confirm your slot within 24 hours.',
  openGraph: { title: 'Book a Discovery Call | ProbeTech', description: 'Tell us where it hurts. Free 30-minute call, no commitment.', type: 'website' },
};

export default function BookCallPage() {
  return (
    <>
      <SiteHeader />
      <main className="public-site mx-auto grid max-w-6xl gap-12 px-6 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <div>
          <div className="mb-9 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Book a discovery call</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Tell us where it hurts.</h1>
            <p className="mt-4 text-lg leading-8 text-subtle">Free 30-minute call. We’ll confirm your slot within 24 hours.</p>
          </div>
          <BookCallForm />
        </div>
        <aside className="h-fit rounded-2xl bg-surface p-6 lg:mt-24">
          <h2 className="text-lg font-semibold tracking-tight">What to expect</h2>
          <ul className="mt-4 space-y-4 text-sm leading-6 text-subtle">
            <li>A relaxed conversation, not a sales pitch</li>
            <li>Honest advice, even if it’s “you don’t need us”</li>
            <li>A written proposal within [X] days if there’s a fit</li>
          </ul>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
