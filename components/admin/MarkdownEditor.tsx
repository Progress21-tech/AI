'use client';

import { useRef, useState } from 'react';
import { MarkdownContent } from '@/lib/content/markdown';

export function MarkdownEditor({ name, label = 'Body (Markdown)', defaultValue = '' }: { name: string; label?: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const makeBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const content = selected || 'bold text';
    const nextValue = `${value.slice(0, start)}**${content}**${value.slice(end)}`;
    setValue(nextValue);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2 + content.length);
    });
  };

  return <div className="grid min-w-0 gap-3 xl:grid-cols-2">
    <div className="min-w-0">
      <label htmlFor={`${name}-markdown`} className="text-sm font-medium">{label}</label>
      <div className="mt-2 mb-2 flex items-center gap-3">
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={makeBold} aria-label="Make selected text bold" className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-semibold hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-black">Bold</button>
        <span className="text-xs text-subtle">Select text first, or edit the inserted “bold text”.</span>
      </div>
      <textarea ref={textareaRef} id={`${name}-markdown`} name={name} value={value} onChange={(event) => setValue(event.target.value)} rows={20} className="block min-w-0 w-full rounded-xl border border-black/10 bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-black" placeholder={'## The problem\n\n## Why it happens\n\n## How to fix it\n\n## When to get help'} />
    </div>
    <div className="min-w-0 overflow-hidden rounded-xl border border-black/10 bg-white p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-subtle">Live preview</p>
      {value ? <MarkdownContent source={value} /> : <p className="text-sm text-subtle">Markdown preview will appear here.</p>}
    </div>
  </div>;
}
