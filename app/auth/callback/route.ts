import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/dashboard';
    const errorParam = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');

    const redirectToSignIn = (message?: string) => {
        const redirectUrl = new URL('/sign-in', request.url);
        if (message) redirectUrl.searchParams.set('error', message);
        return NextResponse.redirect(redirectUrl);
    };

    if (errorParam) {
        return redirectToSignIn(errorDescription || errorParam);
    }

    if (!code) {
        return redirectToSignIn('Missing OAuth code.');
    }

    const response = NextResponse.redirect(new URL(next, request.url));

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        return redirectToSignIn(error.message);
    }

    return response;
