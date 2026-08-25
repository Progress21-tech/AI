'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
export function SignOutButton() { const router = useRouter(); return <button onClick={async () => { await createClient().auth.signOut(); router.replace('/'); router.refresh(); }} className="text-sm underline">Sign out</button>; }
