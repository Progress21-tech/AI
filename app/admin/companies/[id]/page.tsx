import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell, EmptyState, Info, SectionHeading, StatusBadge, formatDate, formatDuration } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminCompanyDetail({ params }: { params: { id: string } }) {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    if (!supabase) notFound();
    const { data: company } = await supabase.from('companies').select('id,name,industry,website,size,owner_id,created_at').eq('id', params.id).maybeSingle();
    if (!company) notFound();
    const { data: interviews } = await supabase.from('interviews').select('id,status,started_at,completed_at,last_activity_at,respondent_name,respondent_role').eq('company_id', params.id).order('started_at', { ascending: false });
    const sessions = interviews ?? [];
    const ids = sessions.map((item: any) => item.id);
    const [{ data: answers }, { data: profiles }] = await Promise.all([
        ids.length ? supabase.from('answers').select('id,interview_id').in('interview_id', ids) : Promise.resolve({ data: [] }),
        company.owner_id ? supabase.from('profiles').select('id,full_name,email').eq('id', company.owner_id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    const completed = sessions.filter((item: any) => item.status === 'completed' || item.status === 'analyzed').length;
    const active = sessions.filter((item: any) => item.status === 'in_progress').length;
    const latest = sessions[0] as any;
    return <AdminShell title={company.name} description="Company profile, interview activity, and operational history.">
        <div className="space-y-8">
            <Link href="/admin/companies" className="text-sm underline underline-offset-4">← Back to companies</Link>
            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-black/10 bg-white p-6"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Company information</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><Info label="Name" value={company.name} /><Info label="Industry" value={company.industry} /><Info label="Size" value={company.size} /><Info label="Website" value={company.website} /><Info label="Owner" value={profiles?.full_name || profiles?.email || company.owner_id} /><Info label="Created" value={formatDate(company.created_at)} /></div></div>
                <div className="rounded-2xl border border-black/10 bg-black p-6 text-white"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">Interview statistics</p><div className="mt-5 grid grid-cols-2 gap-5"><div><p className="text-2xl font-semibold">{sessions.length}</p><p className="text-xs text-white/60">Total interviews</p></div><div><p className="text-2xl font-semibold">{completed}</p><p className="text-xs text-white/60">Completed</p></div><div><p className="text-2xl font-semibold">{active}</p><p className="text-xs text-white/60">In progress</p></div><div><p className="text-2xl font-semibold">{(answers ?? []).length}</p><p className="text-xs text-white/60">Responses</p></div></div><p className="mt-6 border-t border-white/15 pt-4 text-xs text-white/70">Latest interview: {latest ? formatDate(latest.started_at) : 'No interviews yet'}</p></div>
            </section>
            <section><SectionHeading eyebrow="Activity history" title="Interview history" />{sessions.length ? <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">{sessions.map((interview: any) => <Link key={interview.id} href={`/admin/interviews/${interview.id}`} className="grid gap-3 border-b border-black/5 p-5 last:border-0 hover:bg-[#fafafa] sm:grid-cols-[1.3fr_0.8fr_1fr_1fr]"><div><p className="font-semibold">{interview.respondent_name || 'Unnamed respondent'}</p><p className="mt-1 font-mono text-[10px] text-subtle">{interview.id}</p></div><StatusBadge status={interview.status} /><p className="text-sm text-subtle">Started {formatDate(interview.started_at)}</p><p className="text-sm text-subtle">Duration {formatDuration(interview.started_at, interview.completed_at)}</p></Link>)}</div> : <EmptyState>No interviews have been recorded for this company.</EmptyState>}</section>
        </div>
    </AdminShell>;
}
