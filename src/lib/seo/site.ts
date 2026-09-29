export const SITE = {
  name: 'Kalaris Labs',
  url: 'https://kalarislabs.com',
  description:
    'Kalaris Labs builds recursive, self-improving infrastructure for scientific research.',
  email: 'hello@kalarislabs.com',
  language: 'en',
  logoPath: '/kalaris-logo-geometric.png',
  socialImagePath: '/og/default.jpg',
  socialImageAlt:
    'Kalaris Labs: recursive, self-improving infrastructure for scientific research.',
  docsUrl: 'https://docs.kalarislabs.com',
  twitterHandle: '@kalarislabs',
  xUrl: 'https://x.com/kalarislabs',
  founderX: 'https://x.com/sayanchowdhuryai',
  founderTwitter: '@sayanchowdhuryai',
  linkedinUrl: 'https://www.linkedin.com/company/kalarislabs',
  founderLinkedin: 'https://www.linkedin.com/in/sayanchowdhuryai',
  githubUrl: 'https://github.com/KalarisLabs',
} as const;

// Cloudflare Content Signals Policy: only `search`, `ai-input`, and
// `ai-train` are defined keys.
export const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=no';

export function absoluteSiteUrl(path = '/') {
  return new URL(path, SITE.url).toString();
}
