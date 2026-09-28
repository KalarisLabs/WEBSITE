import { absoluteSiteUrl, CONTENT_SIGNAL } from './site';

const DISCOVERY_LINKS = [
  `<${absoluteSiteUrl('/sitemap-index.xml')}>; rel="sitemap"; type="application/xml"`,
  `<${absoluteSiteUrl('/rss.xml')}>; rel="alternate"; type="application/rss+xml"`,
  `<${absoluteSiteUrl('/llms.txt')}>; rel="alternate"; type="text/plain"; title="LLM content index"`,
];

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
    headers.set('Link', DISCOVERY_LINKS.join(', '));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
