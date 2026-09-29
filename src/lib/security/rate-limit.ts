interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface RateLimitBindings {
  SITE_RATE_LIMITER?: RateLimiter;
  CONTACT_RATE_LIMITER?: RateLimiter;
}

function tooManyRequests(request: Request): Response {
  const isApi = new URL(request.url).pathname.startsWith('/api/');
  const headers = { 'retry-after': '60', 'cache-control': 'no-store' };
  if (isApi) {
    return Response.json(
      {
        ok: false,
        code: 'THROTTLED',
        message: 'Please wait before trying again.',
      },
      { status: 429, headers },
    );
  }
  return new Response('Too many requests. Please try again in a minute.', {
    status: 429,
    headers: { ...headers, 'content-type': 'text/plain; charset=utf-8' },
  });
}

/**
 * Per-IP throttling via Workers Rate Limiting bindings. Returns a 429 response
 * when the client is over a limit, or null to continue. Requests without a
 * client IP (local tooling) and environments without the bindings pass through.
 *
 * Page and asset reads (GET/HEAD) are never throttled: one page view fetches
 * dozens of assets, visitors share IPs behind NAT, and a 429 on robots.txt
 * makes Google treat the whole site as disallowed. Cloudflare's DDoS
 * protection covers read floods; these limits cover writes.
 */
export async function enforceRateLimits(
  request: Request,
  bindings: RateLimitBindings,
): Promise<Response | null> {
  if (request.method === 'GET' || request.method === 'HEAD') return null;

  const ip = request.headers.get('cf-connecting-ip');
  if (!ip) return null;

  if (bindings.SITE_RATE_LIMITER) {
    const { success } = await bindings.SITE_RATE_LIMITER.limit({ key: ip });
    if (!success) return tooManyRequests(request);
  }

  const { pathname } = new URL(request.url);
  if (
    bindings.CONTACT_RATE_LIMITER &&
    request.method === 'POST' &&
    pathname === '/api/contact'
  ) {
    const { success } = await bindings.CONTACT_RATE_LIMITER.limit({ key: ip });
    if (!success) return tooManyRequests(request);
  }

  return null;
}
