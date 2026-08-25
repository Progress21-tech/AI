import Link from 'next/link';
import { AdminShell, EmptyState, SectionHeading, formatDate } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminCompaniesPage({ searchParams }: { searchParams: { q?: string } }) {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    if (!supabase) return <AdminShell title="Companies" description="Supabase is not configured."><EmptyState>Unable to load companies.</EmptyState></AdminShell>;
    const query = searchParams.q?.trim() ?? '';
    let companyQuery = supabase.from('companies').select('id,name,industry,website,size,owner_id,created_at,interviews(id,status,started_at,completed_at)').order('created_at', { ascending: false });
    if (query) companyQuery = companyQuery.or(`name.ilike.%${query}%,industry.ilike.%${query}%`);
    const { data } = await companyQuery;
    const companies = data ?? [];
    const ownerIds = companies.map((company: any) => company.owner_id).filter(Boolean);
    const { data: profiles } = ownerIds.length ? await supabase.from('profiles').select('id,full_name,email').in('id', ownerIds) : { data: [] };
    const owners = new Map((profiles ?? []).map((profile: any) => [profile.id, profile.full_name || profile.email || profile.id]));
    return <AdminShell title="Companies" description="Review business accounts, activity levels, and the interviews connected to each company.">
        <SectionHeading eyebrow="Business accounts" title={`${companies.length} ${companies.length === 1 ? 'company' : 'companies'}`} action={<form className="flex gap-2" method="get"><input name="q" defaultValue={query} placeholder="Search companies" className="w-48 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black" /><button className="rounded-lg bg-black px-3 py-2 text-sm text-white">Search</button></form>} />
        {companies.length ? <div className="overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1fr] gap-4 border-b border-black/10 bg-[#fafafa] px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-subtle md:grid"><span>Company</span><span>Owner</span><span>Interviews</span><span>Latest activity</span><span>Created</span></div>{companies.map((company: any) => { const interviews = company.interviews ?? []; const latest = interviews.slice().sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0]; return <Link key={company.id} href={`/admin/companies/${company.id}`} className="grid gap-3 border-b border-black/5 p-5 last:border-0 hover:bg-[#fafafa] md:grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1fr] md:items-center md:gap-4"><div className="min-w-0"><p className="truncate font-semibold">{company.name}</p><p className="mt-1 truncate text-xs text-subtle">{company.industry || 'Industry not captured'}{company.size ? ` · ${company.size}` : ''}</p></div><div className="min-w-0 text-sm"><span className="text-[10px] uppercase text-subtle md:hidden">Owner · </span><span className="break-words">{owners.get(company.owner_id) || company.owner_id || 'Not assigned'}</span></div><p className="text-sm"><span className="text-[10px] uppercase text-subtle md:hidden">Interviews · </span>{interviews.length}</p><p className="text-sm text-subtle"><span className="text-[10px] uppercase md:hidden">Latest · </span>{latest ? formatDate(latest.started_at) : 'No activity'}</p><p className="text-sm text-subtle"><span className="text-[10px] uppercase md:hidden">Created · </span>{formatDate(company.created_at)}</p></Link>; })}</div> : <EmptyState>{query ? 'No companies match your search.' : 'No companies recorded yet.'}</EmptyState>}
    </AdminShell>;
}
