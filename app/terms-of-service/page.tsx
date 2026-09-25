import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export const metadata: Metadata = {
  title: 'Terms of Service | ProbeTech',
  description: 'Terms of Service template for ProbeTech. Final legal wording is pending review.',
  alternates: { canonical: '/terms-of-service' },
  openGraph: { title: 'Terms of Service | ProbeTech', description: 'Terms of Service template for ProbeTech.', type: 'website' },
};

const sections = [
  { title: 'Scope of services', body: '[PLACEHOLDER: describe the services covered and how each project scope is agreed.]' },
  { title: 'Payment terms', body: '[PLACEHOLDER: fill in your actual payment terms, including deposits, milestones, and payment due dates.]' },
  { title: 'Project timelines and change requests', body: '[PLACEHOLDER: explain how timelines are estimated and how scope or change requests are reviewed and approved.]' },
  { title: 'Intellectual property', body: '[PLACEHOLDER: describe ownership and licensing, including what transfers upon full payment.]' },
  { title: 'Liability limitations', body: '[PLACEHOLDER: add liability terms after legal review.]' },
];

export default function TermsOfServicePage() {
  return <>
    <SiteHeader />
    <main className="public-site mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Terms of Service</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Terms of Service</h1>
        <p className="mt-5 rounded-xl border border-black/15 bg-surface p-4 text-sm leading-6"><strong>PLACEHOLDER — final legal review needed before this page goes live.</strong> This page is a structure for future terms, not a contract.</p>
      </div>
      <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
        {sections.map((section) => <section key={section.title} className="grid gap-4 py-7 sm:grid-cols-[12rem_1fr] sm:gap-8"><h2 className="font-semibold tracking-tight">{section.title}</h2><p className="max-w-3xl text-sm leading-7 text-subtle">{section.body}</p></section>)}
      </div>
      <p className="mt-8 text-sm text-subtle">[PLACEHOLDER: final legal review needed before this page goes live]</p>
    </main>
    <SiteFooter />
  </>;
}
