'use client';

import { useState } from 'react';
import { MarkdownContent } from '@/lib/content/markdown';

export function MarkdownEditor({ name, defaultValue = '' }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  return <div className="grid min-w-0 gap-3 xl:grid-cols-2">
    <label className="text-sm font-medium">Body (Markdown)
      <textarea name={name} value={value} onChange={(event) => setValue(event.target.value)} rows={20} className="mt-2 block min-w-0 w-full rounded-xl border border-black/10 bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-black" placeholder={'## The problem\n\n## Why it happens\n\n## How to fix it\n\n## When to get help'} />
    </label>
    <div className="min-w-0 overflow-hidden rounded-xl border border-black/10 bg-white p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-subtle">Live preview</p>
      {value ? <MarkdownContent source={value} /> : <p className="text-sm text-subtle">Markdown preview will appear here.</p>}
    </div>
  </div>;
}
