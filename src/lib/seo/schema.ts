import { absoluteSiteUrl, SITE } from './site';

type JsonLd = Record<string, unknown>;

export interface ArticleSchemaInput {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishDate: Date;
  updatedDate?: Date | undefined;
  tags?: string[];
  section: 'Blog' | 'Research';
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

export function buildArticleSchema(input: ArticleSchemaInput): JsonLd {
  const image = absoluteSiteUrl(input.image ?? SITE.socialImagePath);

  return {
    '@context': 'https://schema.org',
    '@type': input.section === 'Research' ? 'TechArticle' : 'Article',
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
    author: { '@id': `${SITE.url}/#organization` },
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export function serializeJsonLd(value: JsonLd | JsonLd[]) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
