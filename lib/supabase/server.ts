import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type SupabaseCookieMethods = NonNullable<
  NonNullable<Parameters<typeof createServerClient>[2]>['cookies']
>;
type CookiesToSet = Parameters<SupabaseCookieMethods['setAll']>[0];

export async function createServerSupabaseClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handled in server components
          }
        },
      },
    }
  );
}
