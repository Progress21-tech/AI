'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type Props = { hasCaseStudies: boolean; hasBlogs: boolean };

export function SiteNavigation({ hasCaseStudies, hasBlogs }: Props) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const links = [
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    ...(hasCaseStudies ? [{ label: 'Case Studies', href: '/case-studies' }] : []),
    ...(hasBlogs ? [{ label: 'Blogs', href: '/blogs' }] : []),
    { label: 'How We Work', href: '/how-we-work' },
  ];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault(); setOpen(false); toggleRef.current?.focus(); return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { window.cancelAnimationFrame(focusTimer); document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown); };
  }, [open]);

  const close = () => { setOpen(false); window.requestAnimationFrame(() => toggleRef.current?.focus()); };
  const linkStyle = 'text-subtle transition-colors duration-200 ease-out hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black';
  const ctaStyle = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black';

  return <>
    <nav aria-label="Main navigation" className="hidden items-center gap-5 text-sm lg:flex">
      {links.map((link) => <Link key={link.href} className={linkStyle} href={link.href}>{link.label}</Link>)}
      <Link href="/book-a-call" className={ctaStyle}>Book a Discovery Call</Link>
    </nav>
    <button ref={toggleRef} type="button" className="relative z-[70] inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 bg-white text-black transition-colors duration-200 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>
      <span className="sr-only">{open ? 'Close navigation menu' : 'Open navigation menu'}</span>
      <span aria-hidden="true" className="relative block h-4 w-5">
        <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform duration-200 ease-out ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
        <span className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition-opacity duration-200 ease-out ${open ? 'opacity-0' : ''}`} />
        <span className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition-transform duration-200 ease-out ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
      </span>
    </button>
    <AnimatePresence>
      {open && <motion.div className="fixed inset-0 z-[60] bg-black/20 lg:hidden" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
        <motion.div ref={panelRef} id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Site navigation" className="absolute inset-y-0 right-0 flex w-[min(88vw,24rem)] flex-col bg-white px-6 pb-8 pt-24 shadow-2xl" initial={reduceMotion ? false : { x: '100%' }} animate={{ x: 0 }} exit={{ x: reduceMotion ? 0 : '100%' }} transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}>
          <nav aria-label="Mobile navigation" className="flex flex-col items-stretch gap-1">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={close} className="rounded-lg px-3 py-3.5 text-base text-black transition-colors duration-200 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-black">{link.label}</Link>)}
            <Link href="/book-a-call" onClick={close} className={`${ctaStyle} mt-4 w-full`}>Book a Discovery Call</Link>
          </nav>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </>;
}
