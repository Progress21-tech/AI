import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // V1 intentionally does not require authentication.
  // We are using a company-first interview flow and should not redirect
  // unauthenticated users to a sign-in page.
  return NextResponse.next({ request });
}

export const config = {
  matcher: ['/dashboard/:path*', '/discovery/:path*', '/interview/:path*', '/recommendations/:path*', '/admin/:path*'],
};
