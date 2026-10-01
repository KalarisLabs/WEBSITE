import { getPerson, type Person } from '../../data/people';
import { absoluteSiteUrl, SITE } from './site';

export type JsonLd = Record<string, unknown>;

export const FOUNDER_SLUG = 'sayan-chowdhury';

/** Stable entity id for a person: their profile page. */
export function personId(slug: string) {
  return `${SITE.url}/team/${slug}#person`;
}

export type SchemaPerson = Pick<
  Person,
  'slug' | 'name' | 'role' | 'summary' | 'socials'
> &
  Partial<Pick<Person, 'image' | 'focus'>>;

export type ArticleSection = 'Blog' | 'Research' | 'Manifesto';

export interface ArticleSchemaInput {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishDate: Date;
  updatedDate?: Date | undefined;
  tags?: string[];
  section: ArticleSection;
  /** Defaults to the founder. */
  authors?: readonly Pick<Person, 'slug' | 'name'>[];
  wordCount?: number;
}

export interface CollectionSchemaItem {
  title: string;
  description: string;
  url: string;
  publishDate: Date;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

function founder(): Person {
  const person = getPerson(FOUNDER_SLUG);
  if (!person) throw new Error(`Unknown founder slug: ${FOUNDER_SLUG}`);
  return person;
}

export function buildPersonSchema(person: SchemaPerson): JsonLd {
  const sameAs = person.socials.map((social) => social.href);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId(person.slug),
    name: person.name,
    jobTitle: person.role,
    url: absoluteSiteUrl(`/team/${person.slug}`),
    image: person.image ? absoluteSiteUrl(person.image) : undefined,
    worksFor: { '@id': `${SITE.url}/#organization` },
    description: person.summary,
    knowsAbout: person.focus?.length ? person.focus : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function buildFounderPersonSchema(): JsonLd {
  return {
    ...buildPersonSchema(founder()),
    knowsAbout: [
      'Artificial Intelligence',
      'Agentic Systems',
      'Multi-Agent Systems',
      'Agent Infrastructure',
      'Agent Economics',
    ],
  };
}

/** Google ProfilePage: a page whose main entity is one person. */
export function buildProfilePageSchema(
  person: SchemaPerson,
  options: { dateModified?: Date | undefined } = {},
): JsonLd {
  // Nested entities do not repeat @context.
  const entity = buildPersonSchema(person);
  delete entity['@context'];
  const url = absoluteSiteUrl(`/team/${person.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#profile`,
    url,
    dateModified: options.dateModified?.toISOString(),
    isPartOf: { '@id': `${SITE.url}/#website` },
    mainEntity: entity,
  };
}

export function buildAboutPageSchema(
  name: string,
  description: string,
  url: string,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${url}#about`,
    name,
    description,
    url,
    isPartOf: { '@id': `${SITE.url}/#website` },
    about: { '@id': `${SITE.url}/#organization` },
    mainEntity: { '@id': `${SITE.url}/#organization` },
  };
}

export function buildOrganizationSchema(): JsonLd {
  const lead = founder();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    slogan: 'Infrastructure for the agentic era',
    email: SITE.email,
    logo: {
      '@type': 'ImageObject',
      url: absoluteSiteUrl(SITE.logoPath),
      width: 512,
      height: 512,
    },
    sameAs: [SITE.linkedinUrl, SITE.githubUrl, SITE.xUrl].filter(Boolean),
    address: { '@type': 'PostalAddress', addressCountry: 'IN' },
    areaServed: 'Worldwide',
    founder: {
      '@type': 'Person',
      '@id': personId(lead.slug),
      name: lead.name,
      url: absoluteSiteUrl(`/team/${lead.slug}`),
    },
    knowsAbout: [
      'Artificial Intelligence',
      'Agentic AI',
      'Agent Infrastructure',
      'Agent Harnesses',
      'Continual Learning',
      'Multi-Agent Systems',
      'Reinforcement Learning',
      'Game Theory',
      'Agent Protocols',
      'AI Safety',
      'AI Security',
      'AI Evaluations',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: SITE.email,
      contactType: 'general inquiries',
      availableLanguage: ['English'],
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

const ARTICLE_TYPES: Record<ArticleSection, string> = {
  Research: 'TechArticle',
  Blog: 'BlogPosting',
  Manifesto: 'Article',
};

export function buildArticleSchema(input: ArticleSchemaInput): JsonLd {
  const image = absoluteSiteUrl(input.image ?? SITE.socialImagePath);
  const isResearch = input.section === 'Research';
  const authors = input.authors?.length ? input.authors : [founder()];

  return {
    '@context': 'https://schema.org',
    '@type': ARTICLE_TYPES[input.section],
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
    wordCount: input.wordCount,
    about: input.tags?.map((tag) => ({
      '@type': 'Thing',
      name: tag.replaceAll('-', ' '),
    })),
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    author: authors.map((person) => ({
      '@type': 'Person',
      '@id': personId(person.slug),
      name: person.name,
      url: absoluteSiteUrl(`/team/${person.slug}`),
    })),
    publisher: { '@id': `${SITE.url}/#organization` },
    isPartOf: { '@id': `${SITE.url}/#website` },
  };
}

export function buildCollectionPageSchema(
  name: string,
  description: string,
  url: string,
  items: CollectionSchemaItem[],
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: { '@id': `${SITE.url}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        item: {
          '@type': 'Article',
          headline: item.title,
          description: item.description,
          datePublished: item.publishDate.toISOString(),
          url: item.url,
        },
      })),
    },
  };
}

export function serializeJsonLd(value: JsonLd | JsonLd[]) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
