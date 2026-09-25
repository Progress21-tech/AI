import Link from 'next/link';
import { AdminShell, EmptyState, SectionHeading, StatusBadge, formatDate } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function PostsAdminPage({ searchParams }: { searchParams: { q?: string; status?: string; deleted?: string; error?: string } }) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <AdminShell title="Posts" description="Write and publish Insights articles."><EmptyState>Database unavailable.</EmptyState></AdminShell>;
  let query = supabase.from('posts').select('id,title,slug,category,status,published_at,updated_at').order('updated_at', { ascending: false });
  const search = searchParams.q?.trim() ?? '';
  if (search) query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
  if (searchParams.status) query = query.eq('status', searchParams.status);
  const { data, error } = await query;
  const posts = data ?? [];
  return <AdminShell title="Posts" description="Write and publish Insights articles.">
    {searchParams.deleted && <p role="status" className="mb-4 text-sm text-subtle">Post deleted.</p>}
    {searchParams.error && <p role="alert" className="mb-4 text-sm text-red-700">The post could not be deleted or loaded.</p>}
    {error ? <EmptyState>Posts could not be loaded. Confirm the content migration is applied.</EmptyState> : <>
      <SectionHeading eyebrow="Insights content" title={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`} action={<div className="flex flex-wrap gap-2"><form method="get" className="flex gap-2"><input name="q" defaultValue={search} placeholder="Search posts" className="w-36 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" /><select name="status" defaultValue={searchParams.status ?? ''} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option></select><button className="rounded-lg bg-black px-3 py-2 text-sm text-white">Filter</button></form><Link href="/admin/posts/new" className="rounded-lg bg-black px-3 py-2 text-sm text-white">New post</Link></div>} />
      {posts.length ? <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">{posts.map((post) => <Link key={post.id} href={`/admin/posts/${post.id}`} className="grid gap-2 border-b border-black/5 p-4 last:border-0 hover:bg-[#fafafa] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5"><div className="min-w-0"><p className="truncate text-sm font-semibold">{post.title}</p><p className="mt-1 text-xs text-subtle">{post.category} · /blogs/{post.slug}</p></div><StatusBadge status={post.status} /><p className="text-xs text-subtle">Updated {formatDate(post.updated_at)}</p></Link>)}</div> : <EmptyState>{search || searchParams.status ? 'No posts match these filters.' : 'No posts yet. Create a draft to get started.'}</EmptyState>}
    </>}
  </AdminShell>;
}
