'use client';

import { useState } from 'react';
import { imageSourceAndAlt, withImageAlt } from '@/lib/content/media';

export function ImageListUploadField({ name, initialValues = [] }: { name: string; initialValues?: string[] }) {
  const [urls, setUrls] = useState(initialValues);
  const [alt, setAlt] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function upload(file?: File) {
    if (!file) return;
    if (!alt.trim()) { setMessage('Add alt text before uploading.'); return; }
    setBusy(true); setMessage('Uploading…');
    const data = new FormData(); data.set('file', file); data.set('alt', alt.trim()); data.set('name', file.name);
    try {
      const response = await fetch('/api/admin/content/upload', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed.');
      setUrls((items) => [...items, result.url]); setAlt(''); setMessage('Screenshot uploaded.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setBusy(false); }
  }
  return <div>
    <p className="text-sm font-medium">Screenshots</p>
    <label className="mt-3 block text-xs text-subtle">Alt text for the next screenshot
      <input value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={180} className="mt-1 block w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-black" />
    </label>
    <label className="mt-3 block text-xs text-subtle">Upload image (JPG, PNG, WebP, or AVIF; up to 5 MB)
      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={(event) => upload(event.target.files?.[0])} className="mt-1 block w-full text-sm" />
    </label>
    <input type="hidden" name={name} value={JSON.stringify(urls)} />
    <ul className="mt-3 space-y-2">{urls.map((url, index) => <li key={`${url}-${index}`} className="grid gap-2 rounded-lg border border-black/10 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center"><span className="text-xs text-subtle">Screenshot {index + 1}</span><input aria-label={`Screenshot ${index + 1} alt text`} required value={imageSourceAndAlt(url).alt} onChange={(event) => setUrls((items) => items.map((item, itemIndex) => itemIndex === index ? withImageAlt(item, event.target.value) : item))} maxLength={180} placeholder="Describe the screenshot" className="min-w-0 rounded-lg border border-black/10 px-3 py-2 text-sm" /><button type="button" onClick={() => setUrls((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="text-left text-xs underline">Remove</button></li>)}</ul>
    <p role="status" className="mt-2 text-xs text-subtle">{message}</p>
  </div>;
}
