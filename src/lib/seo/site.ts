export const SITE = {
  name: 'Kalaris Labs',
  url: 'https://kalarislabs.com',
  description:
    'Kalaris Labs builds recursive, self-improving infrastructure for scientific research.',
  email: 'contact@kalarislabs.com',
  language: 'en',
  logoPath: '/kalaris-logo-geometric.png',
  socialImagePath: '/og-image.png',
  docsUrl: 'https://docs.kalarislabs.com',
  twitterHandle: '@kalarislabs',
  founderTwitter: '@sayanchowdhuryai',
  linkedinUrl: 'https://www.linkedin.com/company/kalarislabs',
  founderLinkedin: 'https://www.linkedin.com/in/sayanchowdhuryai',
  githubUrl: 'https://github.com/kalaris-labs',
} as const;

export const CONTENT_SIGNAL =
  'search=yes, ai-input=yes, ai-train=no, use=reference';

export function absoluteSiteUrl(path = '/') {
  return new URL(path, SITE.url).toString();
}
