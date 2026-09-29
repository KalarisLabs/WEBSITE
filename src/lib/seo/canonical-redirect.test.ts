import { describe, expect, it } from 'vitest';
import { canonicalRedirect } from './canonical-redirect';

function location(url: string, method = 'GET') {
  const response = canonicalRedirect(new Request(url, { method }));
  return response
    ? { status: response.status, location: response.headers.get('Location') }
    : null;
}

describe('canonicalRedirect', () => {
  it('leaves canonical URLs alone', () => {
    expect(location('https://kalarislabs.com/')).toBeNull();
    expect(location('https://kalarislabs.com/blog?ref=x')).toBeNull();
    expect(location('https://kalarislabs.com/robots.txt')).toBeNull();
  });

  it('upgrades http and www to the https apex in one hop', () => {
    expect(location('http://kalarislabs.com/blog')).toEqual({
      status: 301,
      location: 'https://kalarislabs.com/blog',
    });
    expect(location('http://www.kalarislabs.com/blog/?a=1')).toEqual({
      status: 301,
      location: 'https://kalarislabs.com/blog?a=1',
    });
  });

  it('drops trailing slashes permanently', () => {
    expect(location('https://kalarislabs.com/blog/')).toEqual({
      status: 301,
      location: 'https://kalarislabs.com/blog',
    });
  });

  it('does not redirect form posts or local development hosts', () => {
    expect(location('https://kalarislabs.com/api/contact/', 'POST')).toBeNull();
    expect(location('http://localhost:8787/blog')).toBeNull();
    expect(location('http://localhost:8787/blog/')).toEqual({
      status: 301,
      location: 'http://localhost:8787/blog',
    });
  });
});
