const POSTHOG_HOST =
  import.meta.env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

// PostHog serves its lazy-loaded bundles from the matching "-assets" host.
const POSTHOG_ASSETS_HOST = POSTHOG_HOST.replace(
  '.i.posthog.com',
  '-assets.i.posthog.com',
);

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // 'unsafe-inline' covers Astro's inlined hoisted scripts; 'wasm-unsafe-eval'
  // covers the WebGL/WASM graphics runtimes.
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://challenges.cloudflare.com ${POSTHOG_ASSETS_HOST}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  `connect-src 'self' ${POSTHOG_HOST} ${POSTHOG_ASSETS_HOST} https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://challenges.cloudflare.com`,
  "worker-src 'self' blob:",
  'frame-src https://challenges.cloudflare.com',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const PERMISSIONS_POLICY = [
  'camera=()',
  'microphone=()',
  'geolocation=()',
  'payment=()',
  'usb=()',
  'serial=()',
  'bluetooth=()',
  'hid=()',
  'browsing-topics=()',
].join(', ');

/**
 * Adds browser security headers to every response. The CSP ships as
 * report-only so violations surface in the browser console without breaking
 * pages; switch the header name to `Content-Security-Policy` once clean.
 */
export function applySecurityHeaders(
  request: Request,
  response: Response,
): Response {
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy-Report-Only', CONTENT_SECURITY_POLICY);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', PERMISSIONS_POLICY);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  if (new URL(request.url).protocol === 'https:') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
