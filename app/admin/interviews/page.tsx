import Link from 'next/link';
import { AdminShell, EmptyState, SectionHeading, StatusBadge, formatDate, formatDuration } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminInterviewsPage({ searchParams }: { searchParams: { q?: string; status?: string; sort?: string } }) {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    if (!supabase) return <AdminShell title="Interviews" description="Supabase is not configured."><EmptyState>Unable to load interviews.</EmptyState></AdminShell>;
    const query = searchParams.q?.trim() ?? '';
    const status = searchParams.status ?? '';
    const ascending = searchParams.sort === 'oldest';
    let interviewQuery = supabase.from('interviews').select('id,status,started_at,completed_at,last_activity_at,company_id,created_by,companies(name),interview_questions(id),answers(id),reports(id)').order('started_at', { ascending });
    if (status) interviewQuery = interviewQuery.eq('status', status);
    if (query) interviewQuery = interviewQuery.ilike('id', `%${query}%`);
    const { data } = await interviewQuery;
    const interviews = data ?? [];
    const statuses = [...new Set(interviews.map((interview: any) => interview.status).filter(Boolean))];
    return <AdminShell title="Interviews" description="Track every discovery session, its response volume, status, and generated report state.">
        <SectionHeading eyebrow="Session management" title={`${interviews.length} ${interviews.length === 1 ? 'interview' : 'interviews'}`} action={<form className="flex flex-wrap gap-2" method="get"><input name="q" defaultValue={query} placeholder="Search by ID" className="w-40 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black" /><select name="status" defaultValue={status} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>)}</select><select name="sort" defaultValue={searchParams.sort ?? ''} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"><option value="">Newest first</option><option value="oldest">Oldest first</option></select><button className="rounded-lg bg-black px-3 py-2 text-sm text-white">Apply</button></form>} />
        {interviews.length ? <div className="overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="hidden grid-cols-[1.25fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-black/10 bg-[#fafafa] px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-subtle lg:grid"><span>Company</span><span>Status</span><span>Started</span><span>Duration</span><span>Responses</span><span>Report</span></div>{interviews.map((interview: any) => <Link key={interview.id} href={`/admin/interviews/${interview.id}`} className="grid gap-3 border-b border-black/5 p-5 last:border-0 hover:bg-[#fafafa] lg:grid-cols-[1.25fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr] lg:items-center lg:gap-4"><div className="min-w-0"><p className="truncate font-semibold">{interview.companies?.[0]?.name ?? 'Unknown company'}</p><p className="mt-1 truncate font-mono text-[10px] text-subtle">{interview.id}</p></div><div><span className="text-[10px] uppercase text-subtle lg:hidden">Status · </span><StatusBadge status={interview.status} /></div><p className="text-sm text-subtle"><span className="text-[10px] uppercase lg:hidden">Started · </span>{formatDate(interview.started_at)}</p><p className="text-sm text-subtle"><span className="text-[10px] uppercase lg:hidden">Duration · </span>{formatDuration(interview.started_at, interview.completed_at)}</p><p className="text-sm"><span className="text-[10px] uppercase text-subtle lg:hidden">Responses · </span>{(interview.answers ?? []).length}</p><p className="text-sm"><span className="text-[10px] uppercase text-subtle lg:hidden">Report · </span>{(interview.reports ?? []).length ? 'Generated' : 'Not generated'}</p></Link>)}</div> : <EmptyState>{query || status ? 'No interviews match these filters.' : 'No interviews recorded yet.'}</EmptyState>}
    </AdminShell>;
}
