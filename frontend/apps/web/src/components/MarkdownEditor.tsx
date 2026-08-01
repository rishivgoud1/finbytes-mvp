'use client';

import { useMemo, useState } from 'react';

/**
 * Minimal, dependency-free Markdown renderer for the authoring preview.
 * Supports: headings, bold, italic, inline code, links, blockquotes,
 * unordered/ordered lists and paragraphs. HTML in the source is escaped,
 * so author input cannot inject markup.
 */
function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code class="bg-secondary px-1 py-0.5 text-[0.9em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      '<a href="$2" class="text-[#C9A84C] underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

export function renderMarkdown(src: string): string {
  const lines = src.split(/\r?\n/);
  const out: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let paragraph: string[] = [];

  const closeParagraph = () => {
    if (paragraph.length) {
      out.push(`<p class="mb-4 leading-relaxed">${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeParagraph();
      closeList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      closeParagraph();
      closeList();
      const level = heading[1].length;
      const sizes = ['text-3xl', 'text-2xl', 'text-xl', 'text-lg'];
      out.push(
        `<h${level} class="${sizes[level - 1]} font-bold [font-family:var(--ff-display)] mt-6 mb-3">${inline(
          heading[2]
        )}</h${level}>`
      );
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      closeParagraph();
      closeList();
      out.push(
        `<blockquote class="border-l-2 border-[#C9A84C] pl-4 italic my-4">${inline(
          trimmed.replace(/^>\s?/, '')
        )}</blockquote>`
      );
      continue;
    }

    const ul = /^[-*]\s+(.*)$/.exec(trimmed);
    const ol = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (ul || ol) {
      closeParagraph();
      const wanted: 'ul' | 'ol' = ul ? 'ul' : 'ol';
      if (listType !== wanted) {
        closeList();
        listType = wanted;
        out.push(
          `<${wanted} class="${wanted === 'ul' ? 'list-disc' : 'list-decimal'} pl-6 mb-4 space-y-1">`
        );
      }
      out.push(`<li>${inline((ul ? ul[1] : ol![1]))}</li>`);
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  closeParagraph();
  closeList();
  return out.join('\n');
}

export function MarkdownEditor({
  value,
  onChange,
  height = 460,
}: {
  value: string;
  onChange: (next: string) => void;
  height?: number;
}) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const html = useMemo(() => renderMarkdown(value), [value]);

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-bold transition-colors ${
      active
        ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <div className="border border-border">
      <div className="flex border-b border-border">
        <button type="button" onClick={() => setTab('write')} className={tabClass(tab === 'write')}>
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={tabClass(tab === 'preview')}
        >
          Preview
        </button>
        <span className="ml-auto self-center pr-4 text-[11px] text-muted-foreground">
          Markdown supported
        </span>
      </div>

      {tab === 'write' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ height }}
          placeholder={'Write your manuscript in Markdown…\n\n## A heading\n\nA paragraph with **bold** and *italic* text.\n\n> A pull quote\n\n- A list item'}
          className="w-full p-4 bg-transparent text-[15px] leading-relaxed [font-family:var(--ff-reading)] focus:outline-none resize-y"
        />
      ) : (
        <div
          style={{ minHeight: height }}
          className="p-4 [font-family:var(--ff-reading)] text-[15px]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
