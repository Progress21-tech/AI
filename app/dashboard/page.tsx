import Link from 'next/link';
import { requireUser } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default async function DashboardPage() {
    const auth = await requireUser();
    const supabase = await createServerSupabaseClient();

    let companies: Array<{
        id: string;
        name: string;
        industry: string | null;
        created_at: string;
    }> = [];

    if (supabase) {
        const { data, error } = await supabase
            .from('companies')
            .select('id, name, industry, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to load companies:', error);
        }

        companies = data ?? [];
    }

    return (
        <main className="min-h-screen bg-white p-6 text-black">
            <div className="mx-auto max-w-4xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <p className="font-mono text-xs text-subtle">
                            {auth.user.email}
                        </p>

                        <h1 className="text-3xl font-bold">
                            Your companies
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <SignOutButton />

                        <Link
                            href="/discovery"
                            className="rounded-xl bg-black px-4 py-3 text-sm text-white"
                        >
                            Start discovery
                        </Link>
                    </div>
                </header>

                <section className="grid gap-3">
                    {companies.length ? (
                        companies.map((company) => (
                            <article
                                key={company.id}
                                className="rounded-2xl border border-borderDark p-5"
                            >
                                <h2 className="font-semibold">
                                    {company.name}
                                </h2>

                                <p className="mt-1 text-sm text-subtle">
                                    {company.industry || 'Industry not captured yet'}
                                </p>
                            </article>
                        ))
                    ) : (
                        <p className="rounded-2xl border border-borderDark p-6 text-subtle">
                            No companies yet. Start a discovery interview to create one.
                        </p>
                    )}
                </section>

                {auth.role === 'admin' && (
                    <Link
                        href="/admin"
                        className="inline-block text-sm underline"
                    >
                        Open administration
                    </Link>
                )}
            </div>
        </main>
    );
}