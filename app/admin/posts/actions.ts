'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isStoredImage } from '@/lib/content/media';

function field(form: FormData, key: string) { return String(form.get(key) ?? '').replace(/\0/g, '').trim(); }
function slugify(value: string) { return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90); }

export async function savePost(form: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect('/admin/posts?error=database');
  const id = field(form, 'id');
  const title = field(form, 'title');
  const slug = slugify(field(form, 'slug') || title);
  const status = field(form, 'status');
  const tags = field(form, 'tags').split(',').map((tag) => tag.trim()).filter(Boolean);
  const existing = id ? await supabase.from('posts').select('status,published_at,slug').eq('id', id).maybeSingle() : { data: null };
  const post = {
    slug, title, excerpt: field(form, 'excerpt'), body: field(form, 'body'),
    cover_image_url: field(form, 'cover_image_url') || null,
    category: field(form, 'category'), tags,
    author: field(form, 'author'), status,
    published_at: status === 'published' ? (existing.data?.status === 'published' ? existing.data.published_at : new Date().toISOString()) : null,
    seo_title: field(form, 'seo_title') || null,
    seo_description: field(form, 'seo_description') || null,
  };
  const withinLimits = title.length <= 180 && slug.length <= 90 && post.excerpt.length <= 400 && post.body.length <= 150000 && post.category.length <= 60 && post.author.length <= 100 && tags.length <= 20 && tags.every((tag) => tag.length <= 50) && (post.seo_title?.length ?? 0) <= 180 && (post.seo_description?.length ?? 0) <= 300 && (post.cover_image_url?.length ?? 0) <= 2048;
  if (!title || !slug || !post.excerpt || !post.category || !post.author || !['draft', 'published'].includes(status) || !withinLimits) redirect(`/admin/posts${id ? `/${id}` : '/new'}?error=required`);
  if (post.cover_image_url && !isStoredImage(post.cover_image_url)) redirect(`/admin/posts${id ? `/${id}` : '/new'}?error=image`);
  let duplicateQuery = supabase.from('posts').select('id').eq('slug', slug);
  if (id) duplicateQuery = duplicateQuery.neq('id', id);
  const { data: duplicate } = await duplicateQuery.maybeSingle();
  if (duplicate) redirect(`/admin/posts${id ? `/${id}` : '/new'}?error=slug`);
  const result = id
    ? await supabase.from('posts').update(post).eq('id', id).select('id').single()
    : await supabase.from('posts').insert(post).select('id').single();
  if (result.error || !result.data) redirect(`/admin/posts${id ? `/${id}` : '/new'}?error=save`);
  revalidateTag('content');
  revalidatePath('/'); revalidatePath('/insights'); revalidatePath('/insights/[slug]', 'page'); revalidatePath(`/insights/${slug}`); if (existing.data?.slug) revalidatePath(`/insights/${existing.data.slug}`); revalidatePath('/sitemap.xml');
  redirect(`/admin/posts/${result.data.id}?saved=1`);
}

export async function deletePost(form: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const id = field(form, 'id');
  if (!supabase || !id) redirect('/admin/posts?error=delete');
  const { data: post } = await supabase.from('posts').select('slug').eq('id', id).maybeSingle();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) redirect(`/admin/posts/${id}?error=delete`);
  revalidateTag('content'); revalidatePath('/'); revalidatePath('/insights'); revalidatePath('/insights/[slug]', 'page'); if (post?.slug) revalidatePath(`/insights/${post.slug}`); revalidatePath('/sitemap.xml');
  redirect('/admin/posts?deleted=1');
}
