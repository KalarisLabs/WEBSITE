const CANONICAL_HOST = 'kalarislabs.com';
const PRODUCTION_HOSTS = new Set([CANONICAL_HOST, `www.${CANONICAL_HOST}`]);

/**
 * Returns a permanent redirect to the canonical URL (https, apex host, no
 * trailing slash), or null when the request is already canonical. Other hosts
 * (localhost, workers.dev previews) only get the trailing-slash rule, so local
 * development keeps working over plain http.
 */
export function canonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  let changed = false;

  if (PRODUCTION_HOSTS.has(url.hostname)) {
    if (url.protocol !== 'https:' || url.hostname !== CANONICAL_HOST) {
      url.protocol = 'https:';
      url.hostname = CANONICAL_HOST;
      url.port = '';
      changed = true;
    }
  }

  // Astro uses trailingSlash: 'never'; Workers Static Assets would otherwise
  // answer /blog/ with a temporary 307, which search engines do not treat as
  // a canonical signal.
  const isReadRequest = request.method === 'GET' || request.method === 'HEAD';
  if (isReadRequest && url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    changed = true;
  }

  return changed ? Response.redirect(url.toString(), 301) : null;
}
