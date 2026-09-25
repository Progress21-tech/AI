'use client';

import Link from 'next/link';
import { useState } from 'react';
import { deletePost, savePost } from '@/app/admin/posts/actions';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { SlugField } from '@/components/admin/SlugField';

type Post = { id?: string; title?: string; slug?: string; excerpt?: string; body?: string; cover_image_url?: string | null; category?: string; tags?: string[]; author?: string; status?: string; seo_title?: string | null; seo_description?: string | null };
const inputClass = 'mt-2 block w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-black';

export function PostEditor({ post = {}, error = '', saved = false }: { post?: Post; error?: string; saved?: boolean }) {
  const [title, setTitle] = useState(post.title ?? '');
  return <div className="space-y-6">
    {saved && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Post saved.</p>}
    {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{{ required: 'Complete the required fields.', image: 'Use an uploaded ProbeTech content image and provide alt text.', slug: 'That slug is already in use.', save: 'Could not save the post.', database: 'Database is unavailable.' }[error] ?? 'Something went wrong.'}</p>}
    <form action={savePost} className="space-y-6">
      {post.id && <input type="hidden" name="id" value={post.id} />}
      <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-2">
        <label className="text-sm font-medium md:col-span-2">Title<input name="title" required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} /></label>
        <SlugField kind="posts" title={title} initialSlug={post.slug} excludeId={post.id} />
        <label className="text-sm font-medium">Author<input name="author" required defaultValue={post.author ?? 'Progress Oni'} maxLength={100} className={inputClass} /></label>
        <label className="text-sm font-medium md:col-span-2">Excerpt<textarea name="excerpt" required maxLength={400} rows={3} defaultValue={post.excerpt ?? ''} className={inputClass} /></label>
        <label className="text-sm font-medium">Category<input name="category" required maxLength={60} defaultValue={post.category ?? ''} className={inputClass} /></label>
        <label className="text-sm font-medium">Tags, separated by commas<input name="tags" defaultValue={post.tags?.join(', ') ?? ''} maxLength={300} className={inputClass} /></label>
        <div className="md:col-span-2"><ImageUploadField name="cover_image_url" label="Cover image alt text (required to upload)" initialValue={post.cover_image_url ?? ''} /></div>
        <MarkdownEditor name="body" defaultValue={post.body ?? ''} />
      </section>
      <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-2">
        <label className="text-sm font-medium">Publication status<select name="status" defaultValue={post.status ?? 'draft'} className={inputClass}><option value="draft">Draft</option><option value="published">Published</option></select></label>
        <p className="self-end text-xs leading-5 text-subtle">Published posts appear publicly. Drafts stay visible only in this admin workspace.</p>
        <label className="text-sm font-medium">SEO title<input name="seo_title" maxLength={180} defaultValue={post.seo_title ?? ''} className={inputClass} /></label>
        <label className="text-sm font-medium">SEO description<textarea name="seo_description" maxLength={300} rows={2} defaultValue={post.seo_description ?? ''} className={inputClass} /></label>
      </section>
      <div className="flex flex-wrap items-center gap-3"><button className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Save post</button>{post.id && <><Link href={`/admin/posts/${post.id}/preview`} target="_blank" className="rounded-xl border border-black/15 px-5 py-3 text-sm font-medium">Preview draft</Link><button formAction={deletePost} formNoValidate className="rounded-xl border border-red-200 px-5 py-3 text-sm text-red-700">Delete</button></>}</div>
    </form>
  </div>;
}
