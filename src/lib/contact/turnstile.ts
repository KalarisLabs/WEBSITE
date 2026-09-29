import type { TurnstileAdapter } from './types';

interface TurnstileResponse {
  success: boolean;
  action?: string;
  hostname?: string;
}

const PRODUCTION_HOSTNAMES = ['kalarislabs.com', 'www.kalarislabs.com'];

/**
 * Hostnames a Turnstile token may have been issued on. Production accepts only
 * the canonical domains; other environments also accept localhost and the
 * host serving the request (e.g. the staging workers.dev URL).
 */
export function turnstileHostnamesFor(
  appEnv: string,
  requestHostname: string,
): string[] {
  if (appEnv === 'production') return PRODUCTION_HOSTNAMES;
  return [...PRODUCTION_HOSTNAMES, 'localhost', requestHostname];
}

export function createTurnstileAdapter(
  secret: string,
  expectedHostnames = PRODUCTION_HOSTNAMES,
  fetcher: typeof fetch = fetch,
): TurnstileAdapter {
  return {
    async verify(token, remoteIp) {
      const body = new FormData();
      body.set('secret', secret);
      body.set('response', token);
      if (remoteIp) body.set('remoteip', remoteIp);

      const response = await fetcher(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          body,
        },
      );
      if (!response.ok) return false;

      const result = (await response.json()) as TurnstileResponse;
      return Boolean(
        result.success &&
        result.action === 'contact' &&
        result.hostname &&
        expectedHostnames.includes(result.hostname),
      );
    },
  };
}
