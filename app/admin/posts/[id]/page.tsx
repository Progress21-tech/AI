import { notFound } from 'next/navigation';
import { AdminShell, EmptyState } from '@/components/admin/AdminShell';
import { PostEditor } from '@/components/admin/PostEditor';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function EditPostPage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string; saved?: string } }) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <AdminShell title="Edit post" description="Update an Insights article."><EmptyState>Database unavailable.</EmptyState></AdminShell>;
  const { data, error } = await supabase.from('posts').select('*').eq('id', params.id).maybeSingle();
  if (error) return <AdminShell title="Edit post" description="Update an Insights article."><EmptyState>Post unavailable. Confirm the content migration has been applied.</EmptyState></AdminShell>;
  if (!data) notFound();
  return <AdminShell title="Edit post" description="Update an Insights article."><PostEditor post={data} error={searchParams.error ?? ''} saved={searchParams.saved === '1'} /></AdminShell>;
}
