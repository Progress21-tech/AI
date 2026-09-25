import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getPublishedCaseStudies } from '@/lib/content/data';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Work | ProbeTech',
  description: 'Examples of systems ProbeTech has built for business processes.',
  alternates: { canonical: '/case-studies' },
  openGraph: { title: 'Work | ProbeTech', description: 'Things we’ve built.', type: 'website' },
};

const labels = { automation: 'Automation', chatbot: 'Chatbot', custom_software: 'Custom software' };

export default async function WorkPage({ searchParams }: { searchParams: { service?: string } }) {
  const studies = await getPublishedCaseStudies();
  if (!studies.length) notFound();
  const services = [...new Set(studies.map((study) => study.service_type))];
  const selected = services.includes(searchParams.service as typeof studies[number]['service_type']) ? searchParams.service : '';
  const visible = selected ? studies.filter((study) => study.service_type === selected) : studies;
  return <><SiteHeader /><main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
    <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Case Studies</p><h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Things we’ve built.</h1></div>
    {services.length > 1 && <form method="get" className="mt-8 flex flex-wrap items-center gap-2"><label htmlFor="service" className="text-sm text-subtle">Filter by service</label><select id="service" name="service" defaultValue={selected} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"><option value="">All services</option>{services.map((service) => <option key={service} value={service}>{labels[service]}</option>)}</select><button className="rounded-lg border border-black/15 px-3 py-2 text-sm">Apply</button></form>}
    <div className="mt-10 grid gap-4 md:grid-cols-2">{visible.map((study) => <article key={study.id} className="rounded-2xl border border-black/10 p-6 transition hover:border-black/30"><p className="text-xs font-semibold uppercase tracking-wide text-subtle">{labels[study.service_type]}</p><h2 className="mt-3 text-2xl font-semibold tracking-tight"><Link href={`/case-studies/${study.slug}`} className="hover:underline">{study.project_title}</Link></h2><p className="mt-3 text-sm leading-6 text-subtle">{study.summary}</p>{study.tech_used.length > 0 && <p className="mt-5 text-xs text-subtle">{study.tech_used.join(' · ')}</p>}</article>)}</div>
    {!visible.length && <p className="mt-8 text-sm text-subtle">No published work in this service yet.</p>}
  </main><SiteFooter /></>;
}
