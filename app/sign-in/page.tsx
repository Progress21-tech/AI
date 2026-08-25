import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignInPage() {
    return (
        <Suspense fallback={<AuthLoading />}>
            <AuthForm mode="sign-in" />
        </Suspense>
    );
}

function AuthLoading() {
    return (
        <main className="min-h-screen bg-white p-6 text-black">
            <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
                <div className="w-full rounded-3xl border border-black/10 bg-white/70 p-8 shadow-xl backdrop-blur-xl">
                    <p className="text-center text-sm text-black/60">
                        Loading...
                    </p>
                </div>
            </div>
        </main>
    );
}