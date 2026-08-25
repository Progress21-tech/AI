import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { const redirectUrl = request.nextUrl.clone(); redirectUrl.pathname = '/sign-in'; redirectUrl.searchParams.set('next', request.nextUrl.pathname); return NextResponse.redirect(redirectUrl); }
  return response;
}
export const config = { matcher: ['/dashboard/:path*', '/discovery/:path*', '/interview/:path*', '/recommendations/:path*', '/admin/:path*'] };
