import 'server-only';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export type AuthContext = { user: { id: string; email?: string }; role: 'user' | 'admin' };

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return { user: { id: user.id, email: user.email }, role: profile?.role === 'admin' ? 'admin' : 'user' };
}

export async function requireUser() {
  const context = await getAuthContext();
  if (!context) redirect('/sign-in');
  return context;
}

export async function requireAdmin() {
  const context = await requireUser();
  if (context.role !== 'admin') redirect('/dashboard');
  return context;
}
