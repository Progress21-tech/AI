import { NextResponse } from 'next/server';

// The former adaptive-agent endpoint is deliberately unavailable. Public
// interviews use /start, /answer and /complete and never invoke AI processing.
export async function POST() {
  return NextResponse.json({ error: 'This interview endpoint is no longer in use.' }, { status: 410 });
}
