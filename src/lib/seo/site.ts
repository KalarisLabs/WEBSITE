export const SITE = {
  name: 'Kalaris Labs',
  url: 'https://kalarislabs.com',
  description:
    'Kalaris Labs is a research lab building the infrastructure for the agentic era.',
  email: 'hello@kalarislabs.com',
  language: 'en',
  logoPath: '/icon-512.png',
  socialImagePath: '/og/default.jpg',
  socialImageAlt:
    'Kalaris Labs: building the infrastructure for the agentic era.',
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
