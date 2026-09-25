import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const context = await getAuthContext();
  if (!context || context.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(request.url);
  const kind = url.searchParams.get('kind');
  const slug = url.searchParams.get('slug')?.trim();
  const exclude = url.searchParams.get('exclude');
  if (!slug || !['posts', 'case_studies'].includes(kind ?? '')) return NextResponse.json({ error: 'Invalid check' }, { status: 400 });
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  let query = supabase.from(kind as 'posts' | 'case_studies').select('id').eq('slug', slug);
  if (exclude) query = query.neq('id', exclude);
  const { data, error } = await query.maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not check slug' }, { status: 500 });
  return NextResponse.json({ available: !data });
}
