import { describe, expect, it, vi } from 'vitest';
import { turnstileHostnamesFor } from '../contact/turnstile';
import { applySecurityHeaders } from './headers';
import { enforceRateLimits } from './rate-limit';

function limiter(success: boolean) {
  return { limit: vi.fn().mockResolvedValue({ success }) };
}

function request(path: string, init?: RequestInit, ip = '203.0.113.10') {
  return new Request(`https://kalarislabs.com${path}`, {
    ...init,
    headers: { 'cf-connecting-ip': ip },
  });
}

describe('rate limiting', () => {
  it('never throttles page and asset reads, including robots.txt', async () => {
    const site = limiter(false);
    for (const path of [
      '/',
      '/robots.txt',
      '/sitemap-index.xml',
      '/_astro/a.js',
    ]) {
      expect(
        await enforceRateLimits(request(path), { SITE_RATE_LIMITER: site }),
      ).toBeNull();
      expect(
        await enforceRateLimits(request(path, { method: 'HEAD' }), {
          SITE_RATE_LIMITER: site,
        }),
      ).toBeNull();
    }
    expect(site.limit).not.toHaveBeenCalled();
  });

  it('keys the site limiter by client IP', async () => {
    const site = limiter(true);
    const result = await enforceRateLimits(request('/', { method: 'POST' }), {
      SITE_RATE_LIMITER: site,
    });
    expect(result).toBeNull();
    expect(site.limit).toHaveBeenCalledWith({ key: '203.0.113.10' });
  });

  it('returns 429 with Retry-After when an IP is over the site limit', async () => {
    const result = await enforceRateLimits(request('/', { method: 'POST' }), {
      SITE_RATE_LIMITER: limiter(false),
    });
    expect(result?.status).toBe(429);
    expect(result?.headers.get('retry-after')).toBe('60');
  });

  it('applies the contact limiter only to contact submissions', async () => {
    const contact = limiter(false);
    const bindings = {
      SITE_RATE_LIMITER: limiter(true),
      CONTACT_RATE_LIMITER: contact,
    };
    expect(await enforceRateLimits(request('/blog'), bindings)).toBeNull();
    expect(contact.limit).not.toHaveBeenCalled();

    const result = await enforceRateLimits(
      request('/api/contact', { method: 'POST' }),
      bindings,
    );
    expect(result?.status).toBe(429);
    await expect(result?.json()).resolves.toMatchObject({ code: 'THROTTLED' });
  });
});

describe('security headers', () => {
  it('sets hardening headers and HSTS on HTTPS responses', () => {
    const response = applySecurityHeaders(
      new Request('https://kalarislabs.com/'),
      new Response('ok', { headers: { 'content-type': 'text/html' } }),
    );
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('strict-transport-security')).toContain(
      'max-age=31536000',
    );
    expect(
      response.headers.get('content-security-policy-report-only'),
    ).toContain("frame-ancestors 'none'");
    expect(response.headers.get('permissions-policy')).toContain('camera=()');
  });

  it('works on immutable redirect responses', () => {
    const response = applySecurityHeaders(
      new Request('https://www.kalarislabs.com/'),
      Response.redirect('https://kalarislabs.com/', 308),
    );
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://kalarislabs.com/');
  });
});

describe('turnstile hostnames', () => {
  it('rejects localhost tokens in production', () => {
    expect(
      turnstileHostnamesFor('production', 'kalarislabs.com'),
    ).not.toContain('localhost');
  });

  it('accepts localhost and the serving host elsewhere', () => {
    expect(
      turnstileHostnamesFor('staging', 'staging.example.workers.dev'),
    ).toEqual(
      expect.arrayContaining(['localhost', 'staging.example.workers.dev']),
    );
  });
});
