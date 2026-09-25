'use client';

import { useEffect } from 'react';

/** Reveals public-page sections once as they enter view; admin content is never selected. */
export function SectionRevealObserver() {
  useEffect(() => {
    const targets = [...document.querySelectorAll<HTMLElement>(
      'main.public-site section, main.public-site > article, main.public-site > div, main.public-site > aside, main.public-site > ol',
    )].filter((element) => element.tagName === 'SECTION' || !element.querySelector('section'));
    if (!targets.length) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches || !('IntersectionObserver' in window)) return;

    targets.forEach((element) => { element.dataset.reveal = 'pending'; });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.reveal = 'visible';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    targets.forEach((element) => observer.observe(element));

    const showAll = (event: MediaQueryListEvent) => {
      if (event.matches) targets.forEach((element) => { element.dataset.reveal = 'visible'; });
    };
    motionPreference.addEventListener('change', showAll);
    return () => { observer.disconnect(); motionPreference.removeEventListener('change', showAll); };
  }, []);

  return null;
}
