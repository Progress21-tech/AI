import Link from 'next/link';
import { AdminShell, EmptyState, SectionHeading, formatDate } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminReportsPage() {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    if (!supabase) return <AdminShell title="Reports" description="Supabase is not configured."><EmptyState>Unable to load reports.</EmptyState></AdminShell>;
    const { data } = await supabase.from('reports').select('id,interview_id,executive_summary,created_at,interviews(id,status,company_id,companies(name))').order('created_at', { ascending: false });
    const reports = data ?? [];
    return <AdminShell title="Reports" description="Review generated business intelligence and return to the interview evidence behind each report.">
        <SectionHeading eyebrow="Generated intelligence" title={`${reports.length} ${reports.length === 1 ? 'report' : 'reports'}`} />
        {reports.length ? <div className="space-y-3">{reports.map((report: any) => <Link key={report.id} href={`/admin/interviews/${report.interview_id}`} className="block rounded-2xl border border-black/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition hover:border-black"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{report.interviews?.[0]?.companies?.[0]?.name ?? 'Unknown company'}</p><p className="mt-1 font-mono text-[10px] text-subtle">Interview {report.interview_id}</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700">Generated</span></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-subtle">{report.executive_summary || 'No executive summary available.'}</p><p className="mt-4 text-xs text-subtle">Created {formatDate(report.created_at)} · View interview detail →</p></Link>)}</div> : <EmptyState>No report generated yet.</EmptyState>}
    </AdminShell>;
}
