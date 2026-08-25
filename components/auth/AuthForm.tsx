'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isSignUp = mode === 'sign-up';

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (isSignUp && !result.data.session) {
      setMessage('Check your email to confirm your account, then sign in.');
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setGoogleLoading(false);

    if (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-white p-6 text-black">
      <form onSubmit={submit} className="glass-card w-full max-w-md rounded-2xl border border-borderDark p-7 space-y-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-subtle">AI Business Discovery</p>
          <h1 className="mt-2 text-2xl font-bold">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        </div>

        {isSignUp && (
          <label className="block text-sm">
            Full name
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-borderDark p-3"
            />
          </label>
        )}

        <label className="block text-sm">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-borderDark p-3"
          />
        </label>

        <label className="block text-sm">
          Password
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-borderDark p-3"
          />
        </label>

        {message && <p className="rounded-lg bg-surface p-3 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full rounded-xl bg-black py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-borderDark" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-subtle">or</span>
          <div className="h-px flex-1 bg-borderDark" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full rounded-xl border border-borderDark bg-white py-3 font-medium text-black transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        <p className="text-center text-sm text-subtle">
          {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
          <Link className="text-black underline" href={isSignUp ? '/sign-in' : '/sign-up'}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </form>
    </main>
  );
}

