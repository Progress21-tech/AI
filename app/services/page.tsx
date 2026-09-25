import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export const metadata: Metadata = {
  title: 'Services | ProbeTech',
  description: 'Explore AI automation, AI chatbots and assistants, and custom software from ProbeTech.',
  openGraph: {
    title: 'Services | ProbeTech',
    description: 'Three ways ProbeTech can take work off your plate.',
    type: 'website',
  },
};

const services = [
  {
    number: '01',
    title: 'AI Automation',
    description: 'We connect the tools you already use and automate repetitive tasks across your business. Your team spends less time moving information and more time doing work that needs their judgment.',
    fit: 'Your team repeats the same task every week or moves data between tools by hand.',
    href: '/services/ai-automation',
  },
  {
    number: '02',
    title: 'AI Chatbots & Assistants',
    description: 'We build assistants grounded in your business information to answer common questions, qualify enquiries, and pass complex conversations to your team.',
    fit: 'Customers ask the same questions repeatedly or contact you outside working hours.',
    href: '/services/ai-chatbots',
  },
  {
    number: '03',
    title: 'Custom Software',
    description: 'We build platforms, portals, and dashboards around your real process when off-the-shelf tools do not fit how your business works.',
    fit: 'You have outgrown spreadsheets or existing tools force you into a process that does not fit.',
    href: '/services/custom-software',
  },
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="public-site mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Services</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Three ways we take work off your plate.</h1>
          <p className="mt-5 text-lg leading-8 text-subtle">Every engagement starts with a discovery call. We’ll tell you honestly which of these, if any, fits your problem.</p>
        </div>

        <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
          {services.map((service) => (
            <article key={service.number} className="grid gap-5 py-8 md:grid-cols-[5rem_1fr_1fr] md:gap-8">
              <span className="font-mono text-xs text-subtle">{service.number}</span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{service.title}</h2>
                <p className="mt-3 text-sm leading-7 text-subtle">{service.description}</p>
                <Link href={service.href} className="mt-5 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">Learn more <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <p className="self-start rounded-xl bg-surface p-5 text-sm leading-6"><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-subtle">Good fit if</span>{service.fit}</p>
            </article>
          ))}
        </div>

        <section className="mt-14 flex flex-col items-start justify-between gap-5 rounded-2xl border border-black/10 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Not sure which fits?</h2>
            <p className="mt-2 text-sm leading-6 text-subtle">Tell us what is slowing your business down. We’ll help you think it through.</p>
          </div>
          <Link href="/book-a-call" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/80">Book a Discovery Call <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
