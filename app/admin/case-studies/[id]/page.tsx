import { notFound } from 'next/navigation';
import { AdminShell, EmptyState } from '@/components/admin/AdminShell';
import { CaseStudyEditor } from '@/components/admin/CaseStudyEditor';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function EditCaseStudyPage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string; saved?: string } }) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <AdminShell title="Edit case study" description="Update a work example."><EmptyState>Database unavailable.</EmptyState></AdminShell>;
  const { data, error } = await supabase.from('case_studies').select('*').eq('id', params.id).maybeSingle();
  if (error) return <AdminShell title="Edit case study" description="Update a work example."><EmptyState>Case study unavailable. Confirm the content migration has been applied.</EmptyState></AdminShell>;
  if (!data) notFound();
  return <AdminShell title="Edit case study" description="Update a work example."><CaseStudyEditor study={data} error={searchParams.error ?? ''} saved={searchParams.saved === '1'} /></AdminShell>;
}
