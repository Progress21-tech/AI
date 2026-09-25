import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export type ServicePageContent = {
  title: string;
  intro: string;
  problemTitle: string;
  problem: string;
  sections: { title: string; description?: string; items?: { title: string; description?: string }[] }[];
  timeline: string;
  fit: string;
  cta: string;
  faqs?: { question: string; answer: string }[];
};

export function ServicePage({ content }: { content: ServicePageContent }) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">ProbeTech services</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{content.title}</h1>
            <p className="mt-5 text-lg leading-8 text-subtle">{content.intro}</p>
            <Link href="/book-a-call" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80">Book a Discovery Call <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>

        <section className="border-y border-black/10 bg-surface">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 py-12 sm:grid-cols-[12rem_1fr] sm:gap-8 sm:py-14">
            <h2 className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">The problem</h2>
            <p className="max-w-3xl text-lg leading-8">{content.problem}</p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6">
          {content.sections.map((section, sectionIndex) => (
            <section key={section.title} className="grid gap-6 border-b border-black/10 py-12 sm:grid-cols-[12rem_1fr] sm:gap-8 sm:py-14">
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              <div>
                {section.description && <p className="max-w-3xl text-base leading-7 text-subtle">{section.description}</p>}
                {section.items && (
                  <div className={`grid gap-5 ${section.items.length > 4 ? 'sm:grid-cols-2' : ''}`}>
                    {section.items.map((item, index) => (
                      <article key={item.title} className="border-t border-black/10 pt-4">
                        {content.title.startsWith('Automate') && <span className="font-mono text-xs text-subtle">0{index + 1}</span>}
                        <h3 className="font-medium">{item.title}</h3>
                        {item.description && <p className="mt-2 text-sm leading-6 text-subtle">{item.description}</p>}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}

          <section className="grid gap-6 border-b border-black/10 py-12 sm:grid-cols-[12rem_1fr] sm:gap-8 sm:py-14">
            <h2 className="text-xl font-semibold tracking-tight">Typical timeline</h2>
            <p className="text-base leading-7 text-subtle">{content.timeline}</p>
          </section>
          <section className="grid gap-6 border-b border-black/10 py-12 sm:grid-cols-[12rem_1fr] sm:gap-8 sm:py-14">
            <h2 className="text-xl font-semibold tracking-tight">Good fit if</h2>
            <p className="max-w-3xl text-base leading-7 text-subtle">{content.fit}</p>
          </section>

          {content.faqs && <section className="grid gap-6 border-b border-black/10 py-12 sm:grid-cols-[12rem_1fr] sm:gap-8 sm:py-14">
            <h2 className="text-xl font-semibold tracking-tight">Common questions</h2>
            <div className="divide-y divide-black/10">
              {content.faqs.map((faq) => <article key={faq.question} className="py-5 first:pt-0 last:pb-0"><h3 className="font-medium">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-subtle">{faq.answer}</p></article>)}
            </div>
          </section>}
        </div>

        <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
            <h2 className="max-w-2xl text-2xl font-semibold leading-tight tracking-tight">{content.cta}</h2>
            <Link href="/book-a-call" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80">Book a Discovery Call <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
