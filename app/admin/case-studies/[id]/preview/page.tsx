import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell, EmptyState } from '@/components/admin/AdminShell';
import { imageSourceAndAlt } from '@/lib/content/markdown';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Draft preview | Admin', robots: { index: false, follow: false, noarchive: true } };

export default async function CaseStudyDraftPreview({ params }: { params: { id: string } }) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <AdminShell title="Draft preview" description="Private preview."><EmptyState>Database unavailable.</EmptyState></AdminShell>;
  const { data } = await supabase.from('case_studies').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  return <AdminShell title="Draft preview" description={`Private ${data.status} preview.`}>
    <article className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-6 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{data.service_type.replace(/_/g, ' ')} · Draft preview</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{data.project_title}</h2>
      {data.client_approved_public && data.client_name && <p className="mt-2 text-sm text-subtle">{data.client_name}</p>}
      <p className="mt-4 text-base leading-7 text-subtle">{data.summary}</p>
      {data.problem && <section className="mt-8"><h3 className="text-lg font-semibold">The problem</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-subtle">{data.problem}</p></section>}
      {data.solution && <section className="mt-8"><h3 className="text-lg font-semibold">What we built</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-subtle">{data.solution}</p></section>}
      {!!data.screenshots?.length && <div className="mt-8 grid gap-4 sm:grid-cols-2">{data.screenshots.map((value: string) => { const image = imageSourceAndAlt(value, data.project_title); return <img key={value} src={image.src} alt={image.alt} className="w-full rounded-xl border border-black/10" />; })}</div>}
      {!!data.tech_used?.length && <section className="mt-8"><h3 className="text-lg font-semibold">Tech used</h3><p className="mt-2 text-sm text-subtle">{data.tech_used.join(' · ')}</p></section>}
      {data.result && <section className="mt-8"><h3 className="text-lg font-semibold">The result</h3><p className="mt-2 text-sm leading-7 text-subtle">{data.result}</p></section>}
      {data.testimonial_quote && <blockquote className="mt-8 border-l-2 border-black/20 pl-4"><p className="text-sm leading-7">“{data.testimonial_quote}”</p>{data.testimonial_author && <footer className="mt-2 text-xs text-subtle">{data.testimonial_author}{data.testimonial_role ? ` · ${data.testimonial_role}` : ''}</footer>}</blockquote>}
      <Link href={`/admin/case-studies/${data.id}`} className="mt-8 inline-flex rounded-lg border border-black/15 px-4 py-2 text-sm">Back to editor</Link>
    </article>
  </AdminShell>;
}
