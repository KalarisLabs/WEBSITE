export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  knowsAbout: string[];
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  publisher: { '@id': string };
  inLanguage: string;
}

export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting' | 'ScholarlyArticle' | 'TechArticle';
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
  }[];
  publisher: { '@id': string };
  mainEntityOfPage: string;
}

export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://kalarislabs.com/#organization',
    name: 'Kalaris Labs',
    url: 'https://kalarislabs.com/',
    logo: 'https://kalarislabs.com/brand/kalaris-mark.svg',
    description: 'Kalaris Labs builds recursive, self-improving agentic AI infrastructure for scientific discovery.',
    sameAs: [
      'https://www.linkedin.com/company/kalarislabs/',
      'https://x.com/kalarislabs',
      'https://github.com/kalarislabs',
    ],
    knowsAbout: [
      'AI for Science',
      'Scientific Research Infrastructure',
      'Agentic AI',
      'Scientific Document OCR and Parsing',
      'Evaluation Harnesses',
      'Reproducible Computing',
    ],
  };
}

export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://kalarislabs.com/#website',
    url: 'https://kalarislabs.com/',
    name: 'Kalaris Labs',
    publisher: { '@id': 'https://kalarislabs.com/#organization' },
    inLanguage: 'en',
  };
}
