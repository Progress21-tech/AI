import Link from 'next/link';
import { AdminShell, EmptyState, MetricCard, SectionHeading, StatusBadge, formatDate } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminPage() {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    if (!supabase) return <AdminShell title="Administration" description="Supabase is not configured."><EmptyState>Unable to load administration data.</EmptyState></AdminShell>;
    const [companies, interviews, active, completed, answers, reports, recentCompanies, recentInterviews] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('interviews').select('*', { count: 'exact', head: true }),
        supabase.from('interviews').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('interviews').select('*', { count: 'exact', head: true }).in('status', ['completed', 'analyzed']),
        supabase.from('answers').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('id,name,industry,created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('interviews').select('id,status,started_at,companies(name)').order('started_at', { ascending: false }).limit(8),
    ]);
    return <AdminShell title="Administration" description="Monitor companies, interviews, responses and generated reports across the platform.">
        <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <MetricCard label="Total companies" value={companies.count ?? 0} detail="Registered business profiles" />
                <MetricCard label="Total interviews" value={interviews.count ?? 0} detail="All recorded sessions" />
                <MetricCard label="Active interviews" value={active.count ?? 0} detail="Currently in progress" />
                <MetricCard label="Completed" value={completed.count ?? 0} detail="Completed or analyzed" />
                <MetricCard label="Responses" value={answers.count ?? 0} detail="Saved interview answers" />
                <MetricCard label="Reports" value={reports.count ?? 0} detail="Generated report records" />
            </section>
            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div><SectionHeading eyebrow="Live activity" title="Recent interviews" action={<Link href="/admin/interviews" className="text-sm underline underline-offset-4">View all</Link>} /><div className="overflow-hidden rounded-2xl border border-black/10 bg-white">{(recentInterviews.data ?? []).length ? (recentInterviews.data ?? []).map((interview: any) => <Link key={interview.id} href={`/admin/interviews/${interview.id}`} className="flex items-center justify-between gap-4 border-b border-black/5 p-4 last:border-0 hover:bg-[#fafafa]"><div className="min-w-0"><p className="truncate text-sm font-semibold">{interview.companies?.[0]?.name ?? 'Unknown company'}</p><p className="mt-1 truncate font-mono text-[10px] text-subtle">{interview.id}</p></div><div className="shrink-0 text-right"><StatusBadge status={interview.status} /><p className="mt-1 text-[11px] text-subtle">{formatDate(interview.started_at)}</p></div></Link>) : <EmptyState>No interviews recorded yet.</EmptyState>}</div></div>
                <div><SectionHeading eyebrow="Account growth" title="Recent companies" action={<Link href="/admin/companies" className="text-sm underline underline-offset-4">View all</Link>} /><div className="rounded-2xl border border-black/10 bg-white">{(recentCompanies.data ?? []).length ? (recentCompanies.data ?? []).map((company: any) => <Link key={company.id} href={`/admin/companies/${company.id}`} className="block border-b border-black/5 p-4 last:border-0 hover:bg-[#fafafa]"><p className="truncate text-sm font-semibold">{company.name}</p><p className="mt-1 text-xs text-subtle">{company.industry || 'Industry not captured'} · {formatDate(company.created_at)}</p></Link>) : <EmptyState>No companies recorded yet.</EmptyState>}</div></div>
            </section>
        </div>
    </AdminShell>;
}
