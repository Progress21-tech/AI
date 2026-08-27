import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function publicKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function cookieAdapter() {
  const cookieStore = cookies();
  return {
    getAll: () => cookieStore.getAll(),
    setAll: (items: { name: string; value: string; options?: CookieOptions }[]) => {
      try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Server component cookie writes are intentionally ignored. */ }
    },
  };
}

/** User-scoped client: requests made through this client are subject to RLS. */
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = publicKey();
  if (!url || !key) return null;
  return createServerClient(url, key, { cookies: cookieAdapter() });
}

/** Use only for narrowly scoped trusted operations; never import this in client code. */
export async function createServiceRoleSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // The service key authorizes this server-only client; it never represents a
  // respondent session or sends respondent cookies to Supabase.
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
