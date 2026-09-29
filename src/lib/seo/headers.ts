import { markdownPathFor, prefersMarkdown } from './markdown';
import { absoluteSiteUrl, CONTENT_SIGNAL } from './site';

const DISCOVERY_LINKS = [
  `<${absoluteSiteUrl('/sitemap-index.xml')}>; rel="sitemap"; type="application/xml"`,
  `<${absoluteSiteUrl('/rss.xml')}>; rel="alternate"; type="application/rss+xml"`,
  `<${absoluteSiteUrl('/llms.txt')}>; rel="alternate"; type="text/plain"; title="LLM content index"`,
  `<${absoluteSiteUrl('/llms-full.txt')}>; rel="alternate"; type="text/plain"; title="Full text archive"`,
];

function appendVary(headers: Headers, value: string) {
  const current = headers.get('vary');
  if (!current) headers.set('vary', value);
  else if (
    !current
      .toLowerCase()
      .split(/\s*,\s*/)
      .includes(value.toLowerCase())
  )
    headers.set('vary', `${current}, ${value}`);
}

export function applyDiscoveryHeaders(
  request: Request,
  response: Response,
): Response {
  if (!['GET', 'HEAD'].includes(request.method) || response.status >= 400) {
    return response;
  }

  const headers = new Headers(response.headers);
  const contentType = headers.get('content-type') ?? '';

  if (
    contentType.includes('text/html') ||
    contentType.includes('text/plain') ||
    contentType.includes('text/markdown')
  ) {
    headers.set('Content-Signal', CONTENT_SIGNAL);
  }

  if (contentType.includes('text/html')) {
    const links = [...DISCOVERY_LINKS];
    const markdownPath = markdownPathFor(new URL(request.url).pathname);
    if (markdownPath) {
      // The same URL can also answer with Markdown (see negotiateMarkdown).
      links.unshift(
        `<${absoluteSiteUrl(markdownPath)}>; rel="alternate"; type="text/markdown"`,
      );
      appendVary(headers, 'Accept');
    }
    headers.set('Link', links.join(', '));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * HTTP content negotiation: `Accept: text/markdown` on any page returns its
 * prerendered Markdown twin instead of HTML. Returns null when the client
 * wants HTML or the page has no twin, so the caller serves HTML as usual.
 */
export async function negotiateMarkdown(
  request: Request,
  assets: { fetch(request: Request): Promise<Response> },
): Promise<Response | null> {
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  if (!prefersMarkdown(request.headers.get('accept'))) return null;

  const url = new URL(request.url);
  const markdownPath = markdownPathFor(url.pathname);
  if (!markdownPath) return null;

  const twinUrl = new URL(markdownPath, url);
  const twin = await assets.fetch(new Request(twinUrl, request));
  if (!twin.ok) return null;

  const headers = new Headers(twin.headers);
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.set('Content-Location', markdownPath);
  headers.set('Content-Signal', CONTENT_SIGNAL);
  headers.set('Link', `<${absoluteSiteUrl(url.pathname)}>; rel="canonical"`);
  appendVary(headers, 'Accept');

  return new Response(request.method === 'HEAD' ? null : twin.body, {
    status: 200,
    headers,
  });
}
