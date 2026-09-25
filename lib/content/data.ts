import 'server-only';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

export type PostRecord = {
  id: string; slug: string; title: string; excerpt: string; body: string; cover_image_url: string | null;
  category: string; tags: string[]; author: string; status: string; published_at: string | null;
  seo_title: string | null; seo_description: string | null; created_at: string; updated_at: string;
};
export type CaseStudyRecord = {
  id: string; slug: string; client_name: string | null; project_title: string; summary: string;
  problem: string; solution: string; tech_used: string[]; result: string | null;
  testimonial_quote: string | null; testimonial_author: string | null; testimonial_role: string | null;
  service_type: 'automation' | 'chatbot' | 'custom_software'; screenshots: string[];
  client_approved_public: boolean; status: string; published_at: string | null;
  seo_title: string | null; seo_description: string | null; created_at: string; updated_at: string;
};

function publicDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
}

export const getPublishedPosts = unstable_cache(async (): Promise<PostRecord[]> => {
  const supabase = publicDatabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from('posts').select('*').eq('status', 'published').order('published_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as PostRecord[];
}, ['published-posts-v1'], { revalidate: 300, tags: ['content'] });

export const getPublishedCaseStudies = unstable_cache(async (): Promise<CaseStudyRecord[]> => {
  const supabase = publicDatabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from('case_studies').select('*').eq('status', 'published').eq('client_approved_public', true).order('published_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as CaseStudyRecord[];
}, ['published-case-studies-v1'], { revalidate: 300, tags: ['content'] });

export function absoluteSiteUrl(path = '') {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aibusinessdiscoveryfor.vercel.app').replace(/\/$/, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}
