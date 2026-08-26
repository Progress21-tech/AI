import Link from 'next/link';

export default function CompletePage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#fafafa] p-6 text-black"><section className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm"><p className="text-xs font-semibold uppercase tracking-[.16em] text-subtle">Interview complete</p><h1 className="mt-4 text-3xl font-semibold tracking-tight">You’re done. Thank you.</h1><p className="mt-4 text-sm leading-6 text-subtle">Your responses have been saved. Our team can now review the complete picture of your business.</p><Link href="/discovery" className="mt-7 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white">Start another interview</Link></section></main>;
}
