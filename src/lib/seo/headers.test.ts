import { describe, expect, it } from 'vitest';
import { applyDiscoveryHeaders, negotiateMarkdown } from './headers';

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

describe('markdown content negotiation', () => {
  const assets = {
    fetch: async (request: Request) =>
      new URL(request.url).pathname === '/team.md'
        ? new Response('# Team', {
            headers: { 'Content-Type': 'text/markdown' },
          })
        : new Response('missing', { status: 404 }),
  };

  it('serves the Markdown twin when Markdown is preferred', async () => {
    const response = await negotiateMarkdown(
      new Request('https://kalarislabs.com/team', {
        headers: { Accept: 'text/markdown' },
      }),
      assets,
    );
    expect(response?.headers.get('content-type')).toContain('text/markdown');
    expect(response?.headers.get('vary')).toBe('Accept');
    expect(response?.headers.get('content-location')).toBe('/team.md');
    expect(await response?.text()).toBe('# Team');
  });

  it('falls through for browsers and pages without twins', async () => {
    expect(
      await negotiateMarkdown(
        new Request('https://kalarislabs.com/team', {
          headers: { Accept: 'text/html,*/*;q=0.8' },
        }),
        assets,
      ),
    ).toBeNull();
    expect(
      await negotiateMarkdown(
        new Request('https://kalarislabs.com/missing', {
          headers: { Accept: 'text/markdown' },
        }),
        assets,
      ),
    ).toBeNull();
  });

  it('advertises the twin and varies HTML on Accept', () => {
    const response = applyDiscoveryHeaders(
      new Request('https://kalarislabs.com/team'),
      new Response('<h1>Team</h1>', {
        headers: { 'Content-Type': 'text/html' },
      }),
    );
    expect(response.headers.get('vary')).toBe('Accept');
    expect(response.headers.get('link')).toContain(
      '<https://kalarislabs.com/team.md>; rel="alternate"; type="text/markdown"',
    );
  });
});
