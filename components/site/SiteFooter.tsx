import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-7 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="font-semibold text-black">ProbeTech</Link>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/services" className="hover:text-black">Services</Link>
          <Link href="/how-we-work" className="hover:text-black">How We Work</Link>
          <Link href="/book-a-call" className="hover:text-black">Book a Discovery Call</Link>
        </nav>
      </div>
    </footer>
  );
}
