'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isStoredImage } from '@/lib/content/media';

function field(form: FormData, key: string) { return String(form.get(key) ?? '').replace(/\0/g, '').trim(); }
function slugify(value: string) { return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90); }

export async function saveCaseStudy(form: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect('/admin/case-studies?error=database');
  const id = field(form, 'id');
  const projectTitle = field(form, 'project_title');
  const slug = slugify(field(form, 'slug') || projectTitle);
  const status = field(form, 'status');
  const approved = form.get('client_approved_public') === 'on';
  let screenshots: unknown;
  try { screenshots = JSON.parse(field(form, 'screenshots') || '[]'); } catch { redirect(`/admin/case-studies${id ? `/${id}` : '/new'}?error=screenshots`); }
  if (!Array.isArray(screenshots) || !screenshots.every((item) => typeof item === 'string' && isStoredImage(item))) redirect(`/admin/case-studies${id ? `/${id}` : '/new'}?error=screenshots`);
  const serviceType = field(form, 'service_type');
  const existing = id ? await supabase.from('case_studies').select('status,published_at,slug').eq('id', id).maybeSingle() : { data: null };
  const study = {
    slug,
    client_name: field(form, 'client_name') || null,
    project_title: projectTitle,
    summary: field(form, 'summary'),
    problem: field(form, 'problem'), solution: field(form, 'solution'),
    tech_used: field(form, 'tech_used').split(',').map((item) => item.trim()).filter(Boolean),
    result: field(form, 'result') || null,
    testimonial_quote: field(form, 'testimonial_quote') || null,
    testimonial_author: field(form, 'testimonial_author') || null,
    testimonial_role: field(form, 'testimonial_role') || null,
    service_type: serviceType,
    screenshots: screenshots as string[],
    client_approved_public: approved,
    status,
    published_at: status === 'published' ? (existing.data?.status === 'published' ? existing.data.published_at : new Date().toISOString()) : null,
    seo_title: field(form, 'seo_title') || null,
    seo_description: field(form, 'seo_description') || null,
  };
  const withinLimits = projectTitle.length <= 180 && slug.length <= 90 && study.summary.length <= 300 && study.problem.length <= 20000 && study.solution.length <= 20000 && study.tech_used.length <= 25 && study.tech_used.every((item) => item.length <= 80) && (study.client_name?.length ?? 0) <= 120 && (study.result?.length ?? 0) <= 20000 && (study.testimonial_quote?.length ?? 0) <= 3000 && (study.testimonial_author?.length ?? 0) <= 120 && (study.testimonial_role?.length ?? 0) <= 120 && study.screenshots.length <= 30 && study.screenshots.every((item) => item.length <= 2048) && (study.seo_title?.length ?? 0) <= 180 && (study.seo_description?.length ?? 0) <= 300;
  if (!projectTitle || !slug || !study.summary || !['automation', 'chatbot', 'custom_software'].includes(serviceType) || !['draft', 'published'].includes(status) || !withinLimits) redirect(`/admin/case-studies${id ? `/${id}` : '/new'}?error=required`);
  if (status === 'published' && !approved) redirect(`/admin/case-studies${id ? `/${id}` : '/new'}?error=approval`);
  if (status === 'published' && (!study.problem || !study.solution)) redirect(`/admin/case-studies${id ? `/${id}` : '/new'}?error=required`);
  let duplicateQuery = supabase.from('case_studies').select('id').eq('slug', slug);
  if (id) duplicateQuery = duplicateQuery.neq('id', id);
  const { data: duplicate } = await duplicateQuery.maybeSingle();
  if (duplicate) redirect(`/admin/case-studies${id ? `/${id}` : '/new'}?error=slug`);
  const result = id
    ? await supabase.from('case_studies').update(study).eq('id', id).select('id').single()
    : await supabase.from('case_studies').insert(study).select('id').single();
  if (result.error || !result.data) redirect(`/admin/case-studies${id ? `/${id}` : '/new'}?error=save`);
  revalidateTag('content'); revalidatePath('/'); revalidatePath('/work'); revalidatePath('/work/[slug]', 'page'); revalidatePath(`/work/${slug}`); if (existing.data?.slug) revalidatePath(`/work/${existing.data.slug}`); revalidatePath('/sitemap.xml');
  redirect(`/admin/case-studies/${result.data.id}?saved=1`);
}

export async function deleteCaseStudy(form: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const id = field(form, 'id');
  if (!supabase || !id) redirect('/admin/case-studies?error=delete');
  const { data: study } = await supabase.from('case_studies').select('slug').eq('id', id).maybeSingle();
  const { error } = await supabase.from('case_studies').delete().eq('id', id);
  if (error) redirect(`/admin/case-studies/${id}?error=delete`);
  revalidateTag('content'); revalidatePath('/'); revalidatePath('/work'); revalidatePath('/work/[slug]', 'page'); if (study?.slug) revalidatePath(`/work/${study.slug}`); revalidatePath('/sitemap.xml');
  redirect('/admin/case-studies?deleted=1');
}
