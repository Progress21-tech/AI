'use client';

import { useState } from 'react';
import { imageSourceAndAlt, withImageAlt } from '@/lib/content/media';

export function ImageUploadField({ name, label, initialValue = '' }: { name: string; label: string; initialValue?: string }) {
  const [url, setUrl] = useState(initialValue);
  const [alt, setAlt] = useState(() => imageSourceAndAlt(initialValue).alt);
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
      setUrl(result.url); setMessage('Image uploaded.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-2">
    <label className="block text-sm font-medium">{label}
      <input value={alt} onChange={(event) => { const nextAlt = event.target.value; setAlt(nextAlt); if (url) setUrl(withImageAlt(url, nextAlt)); }} required={Boolean(url)} type="text" maxLength={180} placeholder="Describe the image for someone who cannot see it" className="mt-2 block w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-black" />
    </label>
    <label className="block text-xs text-subtle">Upload JPG, PNG, WebP, or AVIF (up to 5 MB)
      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={(event) => upload(event.target.files?.[0])} className="mt-2 block w-full text-sm" />
    </label>
    <input type="hidden" name={name} value={url} />
    {url && <p className="break-all text-xs text-subtle">Current image: {url.split('#')[0]}</p>}
    <p role="status" className="text-xs text-subtle">{message}</p>
  </div>;
}
