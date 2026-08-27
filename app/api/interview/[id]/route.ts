import { NextRequest, NextResponse } from 'next/server';

// Public interview state is exposed through /api/interview/state?id=… .
// This legacy route intentionally performs no respondent authentication.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL('/api/interview/state', req.url);
  url.searchParams.set('id', params.id);
  return NextResponse.redirect(url);
}

export async function PATCH() {
  return NextResponse.json({ error: 'Interview updates are handled by the answer endpoint.' }, { status: 410 });
}
