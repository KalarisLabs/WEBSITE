import { SITE } from './site';

/**
 * Markdown twin location for an HTML page. Mirrors the build step in
 * `integrations/markdown-twins.mjs`: `/` → `/index.md`, `/team` → `/team.md`.
 * Returns undefined for paths that are already files (have an extension).
 */
export function markdownPathFor(pathname: string): string | undefined {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return '/index.md';
  if (/\.[a-z0-9]+$/i.test(path.split('/').pop() ?? '')) return undefined;
  if (path.startsWith('/api/') || path === '/api') return undefined;
  return `${path}.md`;
}

function parseAccept(accept: string) {
  return accept
    .split(',')
    .map((part) => {
      const [type = '', ...params] = part.trim().toLowerCase().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return { type: type.trim(), q: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((item) => item.type);
}

/**
 * True when the client explicitly asks for Markdown at least as strongly as
 * HTML (`Accept: text/markdown`, or `text/markdown, text/html;q=0.9`).
 * Browsers never send text/markdown, so they always receive HTML.
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const types = parseAccept(accept);
  const quality = (type: string) =>
    types.find((item) => item.type === type)?.q ?? 0;

  const markdown = Math.max(
    quality('text/markdown'),
    quality('text/x-markdown'),
  );
  if (markdown <= 0) return false;
  return markdown >= quality('text/html');
}

/** Rewrites root-relative Markdown links and images to absolute site URLs. */
export function absolutizeMarkdownLinks(markdown: string): string {
  return markdown.replace(
    /(\]\()\/(?!\/)/g,
    (_match, open: string) => `${open}${SITE.url}/`,
  );
}

/**
 * Demotes ATX headings by `levels` (capped at h6) outside fenced code, so
 * articles can nest under a parent heading in combined documents.
 */
export function shiftHeadings(markdown: string, levels: number): string {
  let fence: string | null = null;
  return markdown
    .split('\n')
    .map((line) => {
      const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
      if (fenceMatch?.[1]) {
        const marker = fenceMatch[1];
        if (!fence) fence = marker;
        else if (marker.startsWith(fence[0] ?? '')) fence = null;
        return line;
      }
      if (fence) return line;
      return line.replace(/^(#{1,6})(?=\s)/, (hashes) =>
        '#'.repeat(Math.min(6, hashes.length + levels)),
      );
    })
    .join('\n');
}
