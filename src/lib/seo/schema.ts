import { absoluteSiteUrl, SITE } from './site';

export type JsonLd = Record<string, unknown>;

export interface ArticleSchemaInput {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishDate: Date;
  updatedDate?: Date | undefined;
  tags?: string[];
  section: 'Blog' | 'Research';
  authorName?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFounderPersonSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE.url}/#founder`,
    name: 'Sayan Chowdhury',
    jobTitle: 'Founder',
    worksFor: { '@id': `${SITE.url}/#organization` },
    url: SITE.founderLinkedin,
    sameAs: [SITE.founderLinkedin, 'https://x.com/sayanchowdhuryai'].filter(
      Boolean,
    ),
    description:
      'Agentic researcher and builder focused on systems architecture, scientific infrastructure, and the economic layer of agentic systems.',
    knowsAbout: [
      'Artificial Intelligence',
      'Autonomous Scientific Research',
      'Agentic Systems',
      'Recursive Self-Improvement',
      'Scientific Computing',
    ],
  };
}

export function buildOrganizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    logo: {
      '@type': 'ImageObject',
      url: absoluteSiteUrl(SITE.logoPath),
    },
    sameAs: [
      SITE.linkedinUrl,
      SITE.githubUrl,
      'https://x.com/kalarislabs',
    ].filter(Boolean),
    founder: {
      '@type': 'Person',
      '@id': `${SITE.url}/#founder`,
      name: 'Sayan Chowdhury',
      jobTitle: 'Founder',
      url: SITE.founderLinkedin,
      sameAs: [SITE.founderLinkedin, 'https://x.com/sayanchowdhuryai'].filter(
        Boolean,
      ),
    },
    knowsAbout: [
      'Artificial Intelligence',
      'Scientific Research Infrastructure',
      'Autonomous Agents',
      'Recursive Self-Improving Systems',
      'Distributed Systems',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: SITE.email,
      contactType: 'customer support',
    },
  };
}

export function buildWebsiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : absoluteSiteUrl(item.url),
    })),
  };
}

export function buildFaqSchema(faqs: FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function buildArticleSchema(input: ArticleSchemaInput): JsonLd {
  const image = absoluteSiteUrl(input.image ?? SITE.socialImagePath);
  const isResearch = input.section === 'Research';

  return {
    '@context': 'https://schema.org',
    '@type': isResearch ? 'TechArticle' : 'Article',
    additionalType: isResearch
      ? 'https://schema.org/ScholarlyArticle'
      : undefined,
    '@id': `${input.url}#article`,
    headline: input.title,
    description: input.description,
    url: input.url,
    mainEntityOfPage: input.url,
    image,
    datePublished: input.publishDate.toISOString(),
    dateModified: (input.updatedDate ?? input.publishDate).toISOString(),
    articleSection: input.section,
    keywords: input.tags?.join(', '),
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    author: input.authorName
      ? {
          '@type': 'Person',
          name: input.authorName,
          worksFor: { '@id': `${SITE.url}/#organization` },
        }
      : { '@id': `${SITE.url}/#founder` },
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export function serializeJsonLd(value: JsonLd | JsonLd[]) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
