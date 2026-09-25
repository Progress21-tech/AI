import Link from 'next/link';
import { AdminShell, EmptyState, SectionHeading, StatusBadge, formatDate } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function CaseStudiesAdminPage({ searchParams }: { searchParams: { q?: string; status?: string; deleted?: string; error?: string } }) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <AdminShell title="Case Studies" description="Manage approved public work examples."><EmptyState>Database unavailable.</EmptyState></AdminShell>;
  let query = supabase.from('case_studies').select('id,project_title,client_name,slug,service_type,status,client_approved_public,updated_at').order('updated_at', { ascending: false });
  const search = searchParams.q?.trim() ?? '';
  if (search) query = query.or(`project_title.ilike.%${search}%,client_name.ilike.%${search}%,slug.ilike.%${search}%`);
  if (searchParams.status) query = query.eq('status', searchParams.status);
  const { data, error } = await query;
  const studies = data ?? [];
  return <AdminShell title="Case Studies" description="Manage drafts and client-approved examples of ProbeTech work.">
    {searchParams.deleted && <p role="status" className="mb-4 text-sm text-subtle">Case study deleted.</p>}
    {searchParams.error && <p role="alert" className="mb-4 text-sm text-red-700">The case study could not be deleted or loaded.</p>}
    {error ? <EmptyState>Case studies could not be loaded. Confirm the content migration is applied.</EmptyState> : <>
      <SectionHeading eyebrow="Work content" title={`${studies.length} ${studies.length === 1 ? 'case study' : 'case studies'}`} action={<div className="flex flex-wrap gap-2"><form method="get" className="flex gap-2"><input name="q" defaultValue={search} placeholder="Search work" className="w-36 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" /><select name="status" defaultValue={searchParams.status ?? ''} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option></select><button className="rounded-lg bg-black px-3 py-2 text-sm text-white">Filter</button></form><Link href="/admin/case-studies/new" className="rounded-lg bg-black px-3 py-2 text-sm text-white">New case study</Link></div>} />
      {studies.length ? <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">{studies.map((study) => <Link key={study.id} href={`/admin/case-studies/${study.id}`} className="grid gap-2 border-b border-black/5 p-4 last:border-0 hover:bg-[#fafafa] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5"><div className="min-w-0"><p className="truncate text-sm font-semibold">{study.project_title}</p><p className="mt-1 text-xs text-subtle">{study.client_name || 'Client not listed'} · {study.service_type.replace(/_/g, ' ')} · {study.client_approved_public ? 'Approved' : 'Approval needed'}</p></div><StatusBadge status={study.status} /><p className="text-xs text-subtle">Updated {formatDate(study.updated_at)}</p></Link>)}</div> : <EmptyState>{search || searchParams.status ? 'No case studies match these filters.' : 'No case studies yet. Create a draft to get started.'}</EmptyState>}
    </>}
  </AdminShell>;
}
