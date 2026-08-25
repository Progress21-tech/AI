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
            <div className="mx-auto w-full max-w-5xl">

                {/* Top bar */}
                <header className="flex items-start justify-between gap-4">

                    {/* Page identity */}
                    <div className="min-w-0">
                        <p className="truncate font-mono text-[11px] text-subtle sm:text-xs">
                            {auth.user.email}
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                            Your companies
                        </h1>

                        <p className="mt-1 max-w-md text-sm leading-5 text-subtle">
                            Manage your businesses and discover opportunities
                            for technology and AI.
                        </p>
                    </div>

                    {/* Top-right actions */}
                    <div className="flex shrink-0 flex-col items-end gap-3">

                        {/* Small discovery button */}
                        <Link
                            href="/discovery"
                            className="
                                inline-flex
                                items-center
                                justify-center
                                rounded-lg
                                bg-black
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-white
                                transition
                                hover:bg-black/85
                                active:scale-[0.98]
                                sm:px-4
                                sm:py-2.5
                                sm:text-sm
                            "
                        >
                            + Start discovery
                        </Link>

                        {/* Sign out */}
                        <SignOutButton />
                    </div>
                </header>

                {/* Divider */}
                <div className="my-6 border-t border-borderDark sm:my-8" />

                {/* Companies */}
                <section>
                    {companies.length ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {companies.map((company) => (
                                <article
                                    key={company.id}
                                    className="
                                        rounded-2xl
                                        border
                                        border-borderDark
                                        bg-white
                                        p-4
                                        transition
                                        hover:-translate-y-[1px]
                                        hover:shadow-sm
                                        sm:p-5
                                    "
                                >
                                    <h2 className="break-words font-semibold">
                                        {company.name}
                                    </h2>

                                    <p className="mt-1 break-words text-sm text-subtle">
                                        {company.industry ||
                                            'Industry not captured yet'}
                                    </p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="
                                rounded-2xl
                                border
                                border-borderDark
                                p-5
                                sm:p-8
                            "
                        >
                            <div className="max-w-lg">
                                <p className="text-base font-medium">
                                    No companies yet
                                </p>

                                <p className="mt-1 text-sm leading-6 text-subtle">
                                    Start your first discovery interview to
                                    understand how technology and AI could
                                    improve your business.
                                </p>

                                <Link
                                    href="/discovery"
                                    className="
                                        mt-5
                                        inline-flex
                                        min-h-[42px]
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-black
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-white
                                        transition
                                        hover:bg-black/90
                                        active:scale-[0.98]
                                    "
                                >
                                    Start your first discovery
                                </Link>
                            </div>
                        </div>
                    )}
                </section>

                {/* Admin */}
                {auth.role === 'admin' && (
                    <div className="mt-8 border-t border-borderDark pt-5">
                        <Link
                            href="/admin"
                            className="
                                inline-flex
                                min-h-[44px]
                                items-center
                                text-sm
                                underline
                                underline-offset-4
                            "
                        >
                            Open administration
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}