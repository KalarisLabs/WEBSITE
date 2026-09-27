import type { TurnstileAdapter } from './types';

interface TurnstileResponse {
  success: boolean;
  action?: string;
  hostname?: string;
}

export function createTurnstileAdapter(
  secret: string,
  expectedHostnames = ['kalarislabs.com', 'www.kalarislabs.com', 'localhost'],
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
