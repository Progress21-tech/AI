'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();

        const { error } = await supabase.auth.signOut({
            scope: 'local',
        });

        if (error) {
            console.error('Sign out failed:', error);
            return;
        }

        router.replace('/');
        router.refresh();
    };

    return (
        <button
            type="button"
            onClick={handleSignOut}
            className="text-sm underline underline-offset-4"
        >
            Sign out
        </button>
    );
}