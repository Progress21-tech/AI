import type { ReactNode } from 'react';
export { imageSourceAndAlt } from '@/lib/content/media';

/**
 * A small Markdown renderer for the content editor and public articles.
 * It deliberately renders text through React instead of injecting HTML, so
 * pasted HTML and script tags remain harmless text.
 */
function inline(text: string): ReactNode[] {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern);
  return parts.map((part, index) => {
    const key = `${index}-${part.slice(0, 12)}`;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={key} className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={key}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const safeHref = /^(https?:\/\/|mailto:)/i.test(href) || (href.startsWith('/') && !href.startsWith('//')) ? href : null;
      return safeHref ? <a key={key} href={safeHref} className="underline underline-offset-4" rel={safeHref.startsWith('http') ? 'noreferrer' : undefined}>{label}</a> : label;
    }
    return part;
  });
}

export function MarkdownContent({ source, className = '' }: { source: string; className?: string }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let code: string[] | null = null;
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push(<p key={`p-${blocks.length}`}>{inline(paragraph.join(' '))}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? 'ol' : 'ul';
    blocks.push(<Tag key={`list-${blocks.length}`} className={list.ordered ? 'list-decimal' : 'list-disc'}>{list.items.map((item, index) => <li key={index}>{inline(item)}</li>)}</Tag>);
    list = null;
  };

  lines.forEach((line) => {
    if (line.startsWith('```')) {
      flushParagraph(); flushList();
      if (code) {
        blocks.push(<pre key={`code-${blocks.length}`} className="overflow-x-auto rounded-xl bg-[#111] p-4 text-sm leading-6 text-white"><code>{code.join('\n')}</code></pre>);
        code = null;
      } else code = [];
      return;
    }
    if (code) { code.push(line); return; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      // The article title owns the page's h1, so Markdown # starts at h2.
      const level = Math.min(heading[1].length + 1, 6);
      const text = heading[2];
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      const size = level <= 3 ? 'mt-8 text-2xl font-semibold tracking-tight' : 'mt-6 text-xl font-semibold tracking-tight';
      const headingContent = inline(text);
      const headingProps = { key: `h-${blocks.length}`, id, className: size };
      if (level === 2) blocks.push(<h2 {...headingProps}>{headingContent}</h2>);
      else if (level === 3) blocks.push(<h3 {...headingProps}>{headingContent}</h3>);
      else if (level === 4) blocks.push(<h4 {...headingProps}>{headingContent}</h4>);
      else if (level === 5) blocks.push(<h5 {...headingProps}>{headingContent}</h5>);
      else blocks.push(<h6 {...headingProps}>{headingContent}</h6>);
      return;
    }
    const item = line.match(/^\s*([-*]|\d+\.)\s+(.+)$/);
    if (item) {
      flushParagraph();
      const ordered = /^\d/.test(item[1]);
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push(item[2]);
      return;
    }
    if (!line.trim()) { flushParagraph(); flushList(); return; }
    if (line.startsWith('> ')) {
      flushParagraph(); flushList();
      blocks.push(<blockquote key={`q-${blocks.length}`} className="border-l-2 border-black/20 pl-4 text-subtle">{inline(line.slice(2))}</blockquote>);
      return;
    }
    if (/^---+$/.test(line.trim())) { flushParagraph(); flushList(); blocks.push(<hr key={`hr-${blocks.length}`} className="border-black/10" />); return; }
    paragraph.push(line.trim());
  });
  flushParagraph(); flushList();
  const trailingCode = code as string[] | null;
  if (trailingCode) blocks.push(<pre key={`code-${blocks.length}`} className="overflow-x-auto rounded-xl bg-[#111] p-4 text-sm leading-6 text-white"><code>{trailingCode.join('\n')}</code></pre>);

  return <div className={`space-y-5 leading-7 [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:space-y-2 [&_ul]:pl-6 ${className}`}>{blocks}</div>;
}

export function estimateReadMinutes(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
