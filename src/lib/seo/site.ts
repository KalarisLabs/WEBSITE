export const SITE = {
  name: 'Kalaris Labs',
  url: 'https://kalarislabs.com',
  description:
    'Kalaris Labs builds thoughtful technology through software engineering and applied research.',
  email: 'contact@kalarislabs.com',
  language: 'en',
  logoPath: '/kalaris-logo-geometric.png',
  socialImagePath: '/og-image.svg',
  docsUrl: 'https://docs.kalarislabs.com',
} as const;

export const CONTENT_SIGNAL =
  'search=yes, ai-input=yes, ai-train=no, use=reference';

export function absoluteSiteUrl(path = '/') {
  return new URL(path, SITE.url).toString();
}
