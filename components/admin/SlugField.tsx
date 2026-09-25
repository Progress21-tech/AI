'use client';

import { useEffect, useState } from 'react';

export function slugify(value: string) { return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90); }

export function SlugField({ kind, initialSlug = '', title, excludeId }: { kind: 'posts' | 'case_studies'; initialSlug?: string; title: string; excludeId?: string }) {
  const [slug, setSlug] = useState(initialSlug || slugify(title));
  const [manual, setManual] = useState(Boolean(initialSlug));
  const [result, setResult] = useState('');
  useEffect(() => { if (!manual) setSlug(slugify(title)); }, [title, manual]);
  async function check() {
    if (!slug) { setResult('Enter a title to create a slug.'); return; }
    const query = new URLSearchParams({ kind, slug });
    if (excludeId) query.set('exclude', excludeId);
    const response = await fetch(`/api/admin/content/slug-available?${query}`);
    const data = await response.json();
    setResult(data.available ? 'Slug is available.' : 'That slug is already in use.');
  }
  return <label className="text-sm font-medium">URL slug
    <div className="mt-2 flex gap-2"><input name="slug" required value={slug} onChange={(event) => { setSlug(slugify(event.target.value)); setManual(true); setResult(''); }} onBlur={check} className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-black" /><button type="button" onClick={check} className="rounded-lg border border-black/10 px-3 text-xs">Check</button></div>
    <span aria-live="polite" className="mt-1 block text-xs text-subtle">{result || `/${kind === 'posts' ? 'insights' : 'work'}/${slug || 'your-slug'}`}</span>
  </label>;
}
