import { describe, expect, it } from 'vitest';
import { applyDiscoveryHeaders } from './headers';

describe('discovery response headers', () => {
  it('adds discovery and content-use signals to HTML responses', async () => {
    const response = applyDiscoveryHeaders(
      new Request('https://kalarislabs.com/'),
      new Response('<h1>Kalaris Labs</h1>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    );

    expect(response.headers.get('content-signal')).toContain('ai-train=no');
    expect(response.headers.get('link')).toContain('/sitemap-index.xml');
    expect(await response.text()).toContain('Kalaris Labs');
  });

  it('does not rewrite unsuccessful responses', () => {
    const original = new Response('missing', { status: 404 });
    expect(
      applyDiscoveryHeaders(
        new Request('https://kalarislabs.com/missing'),
        original,
      ),
    ).toBe(original);
  });
});
