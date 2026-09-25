import { AdminShell } from '@/components/admin/AdminShell';
import { PostEditor } from '@/components/admin/PostEditor';
import { requireAdmin } from '@/lib/auth/server';

export default async function NewPostPage({ searchParams }: { searchParams: { error?: string } }) {
  await requireAdmin();
  return <AdminShell title="New post" description="Create a draft or publish an Insights article."><PostEditor error={searchParams.error ?? ''} /></AdminShell>;
}
