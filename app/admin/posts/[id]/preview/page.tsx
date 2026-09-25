import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell, EmptyState } from '@/components/admin/AdminShell';
import { MarkdownContent, estimateReadMinutes, imageSourceAndAlt } from '@/lib/content/markdown';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Draft preview | Admin', robots: { index: false, follow: false, noarchive: true } };

export default async function PostDraftPreview({ params }: { params: { id: string } }) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <AdminShell title="Draft preview" description="Private preview."><EmptyState>Database unavailable.</EmptyState></AdminShell>;
  const { data } = await supabase.from('posts').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const image = data.cover_image_url ? imageSourceAndAlt(data.cover_image_url, data.title) : null;
  return <AdminShell title="Draft preview" description={`Private ${data.status} preview.`}>
    <article className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-6 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{data.category} · Draft preview</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{data.title}</h2>
      <p className="mt-4 text-base leading-7 text-subtle">{data.excerpt}</p>
      <p className="mt-3 text-xs text-subtle">{data.author} · {estimateReadMinutes(data.body)} min read</p>
      {image && <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" /></div>}
      <MarkdownContent source={data.body} className="prose-content mt-8" />
      <Link href={`/admin/posts/${data.id}`} className="mt-8 inline-flex rounded-lg border border-black/15 px-4 py-2 text-sm">Back to editor</Link>
    </article>
  </AdminShell>;
}
