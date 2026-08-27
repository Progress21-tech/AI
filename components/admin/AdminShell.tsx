import Link from 'next/link';
import { SignOutButton } from '@/components/auth/SignOutButton';

export function AdminShell({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <main className="min-h-screen bg-[#f7f8fa] text-black">
            <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                <header className="border-b border-black/10 pb-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <Link href="/admin" className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">Admin control center</Link>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                            <p className="mt-2 max-w-2xl text-sm text-subtle">{description}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 font-medium">Restricted workspace</span>
                            <SignOutButton />
                        </div>
                    </div>
                    <nav className="mt-6 flex flex-wrap gap-2 text-sm">
                        {[
                            ['/admin', 'Overview'],
                            ['/admin/companies', 'Companies'],
                            ['/admin/interviews', 'Interviews'],
                        ].map(([href, label]) => <Link key={href} href={href} className="rounded-lg border border-black/10 bg-white px-3 py-2 transition hover:border-black hover:bg-black hover:text-white">{label}</Link>)}
                    </nav>
                </header>
                <div className="py-7">{children}</div>
            </div>
        </main>
    );
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
    const label = status ? status.replace(/_/g, ' ') : 'Unknown';
    const tone = status === 'completed' || status === 'analyzed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : status === 'analysis_pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200';
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${tone}`}>{label}</span>;
}

export function MetricCard({ label, value, detail }: { label: string; value: number; detail: string }) {
    return <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"><p className="text-xs font-medium uppercase tracking-wide text-subtle">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{value.toLocaleString()}</p><p className="mt-2 text-xs text-subtle">{detail}</p></article>;
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
    return <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div>{eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">{eyebrow}</p>}<h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2></div>{action}</div>;
}

export function Info({ label, value }: { label: string; value: unknown }) {
    const display = value === null || value === undefined || value === '' ? 'Not available' : String(value);
    return <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-subtle">{label}</p><p className="mt-1 break-words text-sm">{display}</p></div>;
}

export function formatDate(value: string | null | undefined) { return value ? new Date(value).toLocaleString() : 'Not available'; }
export function formatDuration(start: string | null | undefined, end: string | null | undefined) { if (!start || !end) return 'Not available'; const seconds = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)); return `${Math.floor(seconds / 60)}m ${seconds % 60}s`; }

export function ReadableValue({ value }: { value: unknown }) {
    if (value === null || value === undefined || value === '') return <span className="italic text-subtle">Not available</span>;
    if (Array.isArray(value)) return <ul className="list-disc space-y-1 pl-5">{value.map((item, index) => <li key={index}><ReadableValue value={item} /></li>)}</ul>;
    if (typeof value === 'object') return <dl className="space-y-2">{Object.entries(value as Record<string, unknown>).map(([key, item]) => <div key={key} className="grid gap-1 sm:grid-cols-[10rem_1fr]"><dt className="font-mono text-[10px] uppercase tracking-wide text-subtle">{key.replace(/_/g, ' ')}</dt><dd><ReadableValue value={item} /></dd></div>)}</dl>;
    return <span className="whitespace-pre-wrap break-words">{String(value)}</span>;
}

export function EmptyState({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border border-dashed border-black/15 bg-white p-8 text-center text-sm text-subtle">{children}</div>; }
