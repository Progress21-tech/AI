'use client';

import Link from 'next/link';
import { useState } from 'react';
import { deleteCaseStudy, saveCaseStudy } from '@/app/admin/case-studies/actions';
import { ImageListUploadField } from '@/components/admin/ImageListUploadField';
import { SlugField } from '@/components/admin/SlugField';

type Study = { id?: string; slug?: string; client_name?: string | null; project_title?: string; summary?: string; problem?: string; solution?: string; tech_used?: string[]; result?: string | null; testimonial_quote?: string | null; testimonial_author?: string | null; testimonial_role?: string | null; service_type?: string; screenshots?: string[]; client_approved_public?: boolean; status?: string; seo_title?: string | null; seo_description?: string | null };
const control = 'mt-2 block w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-black';
const errorText: Record<string, string> = { required: 'Complete the required fields before publishing.', approval: 'Client approval must be confirmed before publishing.', slug: 'That slug is already in use.', screenshots: 'The screenshot list is invalid.', save: 'Could not save the case study.', database: 'Database is unavailable.', delete: 'Could not delete the case study.' };

export function CaseStudyEditor({ study = {}, error = '', saved = false }: { study?: Study; error?: string; saved?: boolean }) {
  const [title, setTitle] = useState(study.project_title ?? '');
  return <div className="space-y-6">
    {saved && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Case study saved.</p>}
    {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{errorText[error] ?? 'Something went wrong.'}</p>}
    <form action={saveCaseStudy} className="space-y-6">
      {study.id && <input type="hidden" name="id" value={study.id} />}
      <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-2">
        <label className="text-sm font-medium md:col-span-2">Project title<input name="project_title" required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} className={control} /></label>
        <SlugField kind="case_studies" title={title} initialSlug={study.slug} excludeId={study.id} />
        <label className="text-sm font-medium">Client name<input name="client_name" maxLength={120} defaultValue={study.client_name ?? ''} className={control} /><span className="mt-1 block text-xs font-normal text-subtle">Shown publicly only after client approval is recorded.</span></label>
        <label className="text-sm font-medium md:col-span-2">One-line summary<input name="summary" required maxLength={300} defaultValue={study.summary ?? ''} className={control} /></label>
        <label className="text-sm font-medium">Service type<select name="service_type" required defaultValue={study.service_type ?? 'custom_software'} className={control}><option value="automation">Automation</option><option value="chatbot">Chatbot</option><option value="custom_software">Custom software</option></select></label>
        <label className="text-sm font-medium">Technologies, separated by commas<input name="tech_used" maxLength={300} defaultValue={study.tech_used?.join(', ') ?? ''} className={control} /></label>
        <label className="text-sm font-medium">The problem<textarea name="problem" rows={5} defaultValue={study.problem ?? ''} className={control} /></label>
        <label className="text-sm font-medium">What we built<textarea name="solution" rows={5} defaultValue={study.solution ?? ''} className={control} /></label>
        <div className="md:col-span-2"><ImageListUploadField name="screenshots" initialValues={study.screenshots ?? []} /></div>
      </section>
      <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-2">
        <label className="text-sm font-medium">Result (optional)<textarea name="result" rows={3} defaultValue={study.result ?? ''} className={control} /></label>
        <label className="text-sm font-medium">Testimonial quote (optional)<textarea name="testimonial_quote" rows={3} defaultValue={study.testimonial_quote ?? ''} className={control} /></label>
        <label className="text-sm font-medium">Testimonial author<input name="testimonial_author" defaultValue={study.testimonial_author ?? ''} className={control} /></label>
        <label className="text-sm font-medium">Testimonial role<input name="testimonial_role" defaultValue={study.testimonial_role ?? ''} className={control} /></label>
        <label className="text-sm font-medium">SEO title<input name="seo_title" maxLength={180} defaultValue={study.seo_title ?? ''} className={control} /></label>
        <label className="text-sm font-medium">SEO description<textarea name="seo_description" maxLength={300} rows={2} defaultValue={study.seo_description ?? ''} className={control} /></label>
      </section>
      <section className="space-y-5 rounded-2xl border border-black/10 bg-white p-5">
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="client_approved_public" defaultChecked={study.client_approved_public ?? false} className="mt-1 h-4 w-4 accent-black" /><span><span className="font-semibold">Client approved for public use</span><span className="mt-1 block text-sm text-subtle">Confirm the client has agreed to be named and featured before publishing.</span></span></label>
        <label className="block text-sm font-medium">Publication status<select name="status" defaultValue={study.status ?? 'draft'} className={control}><option value="draft">Draft</option><option value="published">Published</option></select></label>
      </section>
      <div className="flex flex-wrap gap-3"><button className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Save case study</button>{study.id && <><Link href={`/admin/case-studies/${study.id}/preview`} target="_blank" className="rounded-xl border border-black/15 px-5 py-3 text-sm font-medium">Preview draft</Link><button formAction={deleteCaseStudy} formNoValidate onClick={(event) => { if (!window.confirm('Delete this case study?')) event.preventDefault(); }} className="rounded-xl border border-red-200 px-5 py-3 text-sm text-red-700">Delete</button></>}</div>
    </form>
  </div>;
}
