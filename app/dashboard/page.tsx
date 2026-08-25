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
        <main className="min-h-screen bg-white px-4 py-5 text-black sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-8">

                {/* Header */}
                <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="truncate font-mono text-xs text-subtle">
                            {auth.user.email}
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                            Your companies
                        </h1>

                        <p className="mt-1 text-sm text-subtle">
                            Manage your businesses and start new discoveries.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                        <Link
                            href="/discovery"
                            className="flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-black/90 sm:w-auto"
                        >
                            Start discovery
                        </Link>

                        <div className="flex w-full justify-center sm:w-auto">
                            <SignOutButton />
                        </div>
                    </div>
                </header>

                {/* Companies */}
                <section className="grid gap-3">
                    {companies.length ? (
                        companies.map((company) => (
                            <article
                                key={company.id}
                                className="rounded-2xl border border-borderDark bg-white p-4 transition hover:shadow-sm sm:p-5"
                            >
                                <h2 className="break-words font-semibold">
                                    {company.name}
                                </h2>

                                <p className="mt-1 break-words text-sm text-subtle">
                                    {company.industry ||
                                        'Industry not captured yet'}
                                </p>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-borderDark p-5 sm:p-6">
                            <p className="text-sm leading-6 text-subtle">
                                No companies yet. Start a discovery interview
                                to create one.
                            </p>

                            <Link
                                href="/discovery"
                                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white sm:w-auto"
                            >
                                Start your first discovery
                            </Link>
                        </div>
                    )}
                </section>

                {/* Admin */}
                {auth.role === 'admin' && (
                    <div className="border-t border-borderDark pt-5">
                        <Link
                            href="/admin"
                            className="inline-flex min-h-[44px] items-center text-sm underline underline-offset-4"
                        >
                            Open administration
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}