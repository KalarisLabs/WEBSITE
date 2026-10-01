import { company } from '../../data/company';
import { FAQS } from '../../data/faqs';
import { getPerson } from '../../data/people';
import { absolutizeMarkdownLinks, shiftHeadings } from './markdown';
import { absoluteSiteUrl, CONTENT_SIGNAL, SITE } from './site';

export type DiscoveryCollection = 'blog' | 'research';

export interface DiscoveryEntry {
  collection: DiscoveryCollection;
  entry: {
    id: string;
    body?: string;
    data: {
      title: string;
      description: string;
      publishDate: Date;
      updatedDate?: Date | undefined;
      tags: string[];
      /** Person slugs; defaults to the founder. */
      authors?: string[];
    };
  };
}

/** Display names for an entry's authors, falling back to the slug. */
export function authorNames(authors: readonly string[] | undefined) {
  const slugs = authors?.length ? authors : ['sayan-chowdhury'];
  return slugs.map((slug) => getPerson(slug)?.name ?? slug);
}

export function entryPath(
  collection: DiscoveryCollection,
  entry: { id: string },
) {
  return `/${collection}/${entry.id}`;
}

// Search and user-initiated retrieval agents that should always be able to
// read the site. Training crawlers fall under `*` and receive the
// Content-Signal preference instead.
export const AI_RETRIEVAL_AGENTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Googlebot',
  'Bingbot',
  'Applebot',
  'Applebot-Extended',
  'DuckAssistBot',
  'MistralAI-User',
  'Amazonbot',
  'Meta-ExternalFetcher',
  'YouBot',
];

export function buildRobotsTxt() {
  return [
    '# Kalaris Labs welcomes search engines and AI answer agents.',
    '# Machine-readable index: /llms.txt (full text: /llms-full.txt)',
    '# Every page has a Markdown twin: append .md to its path (/ -> /index.md)',
    '# or request it with the header "Accept: text/markdown".',
    '',
    ...AI_RETRIEVAL_AGENTS.map((agent) => `User-agent: ${agent}`),
    `Content-Signal: ${CONTENT_SIGNAL}`,
    'Allow: /',
    'Disallow: /api/',
    '',
    'User-agent: *',
    `Content-Signal: ${CONTENT_SIGNAL}`,
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${absoluteSiteUrl('/sitemap-index.xml')}`,
    '',
  ].join('\n');
}

function entryLink(
  collection: DiscoveryCollection,
  entry: DiscoveryEntry['entry'],
) {
  const page = absoluteSiteUrl(entryPath(collection, entry));
  return `- [${entry.data.title}](${page}.md): ${entry.data.description}`;
}

interface SitePage {
  title: string;
  path: string;
  description: string;
}

/** HTML pages outside the content collections, in llms.txt order. */
export const SITE_PAGES: SitePage[] = [
  {
    title: 'Home',
    path: '/',
    description: `${SITE.name} overview, mission, partners, and FAQ.`,
  },
  {
    title: 'Research',
    path: '/research',
    description: 'Index of published research notes.',
  },
  {
    title: 'Blog',
    path: '/blog',
    description:
      'Index of engineering deep-dives and research essays on agents, safety, and the agentic economy.',
  },
  {
    title: 'Manifesto',
    path: '/manifesto',
    description:
      'Infrastructure for the agentic era, and why it must be safe, clean, and governable.',
  },
  {
    title: 'Company',
    path: '/company',
    description:
      'Mission, principles, research areas, and how to partner with Kalaris Labs.',
  },
  {
    title: 'Team',
    path: '/team',
    description: 'Founder, team profiles, and culture.',
  },
  {
    title: 'Careers',
    path: '/careers',
    description: `Open positions; apply by email to ${SITE.email}.`,
  },
  {
    title: 'Fellowship',
    path: '/fellowship',
    description:
      'The Kalaris Labs Fellowship for high-agency designers, growth marketers, and marketers; pick your hats, print a badge, and apply.',
  },
  {
    title: 'Brand',
    path: '/brand',
    description:
      'Brand kit: logo marks, colour tokens, typography, and install snippets.',
  },
  {
    title: 'Press',
    path: '/press',
    description: 'Company facts, approved descriptions, and media assets.',
  },
];

const LEGAL_PAGES: SitePage[] = [
  {
    title: 'Privacy policy',
    path: '/privacy',
    description: 'How the site handles personal data and analytics consent.',
  },
  {
    title: 'Terms',
    path: '/terms',
    description: 'Terms and conditions for using the site.',
  },
];

/** Markdown twin URL for a page path (`/` → `/index.md`). */
export function markdownUrl(path: string) {
  return absoluteSiteUrl(path === '/' ? '/index.md' : `${path}.md`);
}

function pageLink(page: SitePage) {
  return `- [${page.title}](${markdownUrl(page.path)}): ${page.description}`;
}

/** Markdown twin of an article, served at `/<collection>/<slug>.md`. */
export function buildEntryMarkdown(
  collection: DiscoveryCollection,
  entry: DiscoveryEntry['entry'] & {
    data: { socialImage?: string | undefined };
  },
) {
  const { data } = entry;
  const canonical = absoluteSiteUrl(entryPath(collection, entry));
  return [
    `# ${data.title}`,
    '',
    `> ${data.description}`,
    '',
    `- Canonical URL: ${canonical}`,
    `- Section: ${collection === 'research' ? 'Research' : 'Blog'}`,
    `- Author: ${authorNames(data.authors).join(', ')}, ${SITE.name}`,
    `- Published: ${data.publishDate.toISOString().slice(0, 10)}`,
    ...(data.updatedDate
      ? [`- Updated: ${data.updatedDate.toISOString().slice(0, 10)}`]
      : []),
    ...(data.tags.length ? [`- Tags: ${data.tags.join(', ')}`] : []),
    '',
    absolutizeMarkdownLinks(entry.body?.trim() || data.description),
    '',
  ].join('\n');
}

// Follows the llms.txt proposal (https://llmstxt.org): H1, summary
// blockquote, free-form context, then H2 sections of annotated links. Article
// links point at the Markdown twins so agents skip HTML parsing.
export function buildLlmsTxt(entries: DiscoveryEntry[]) {
  const linksFor = (collection: DiscoveryCollection) => {
    const links = entries
      .filter((item) => item.collection === collection)
      .map(({ entry }) => entryLink(collection, entry));
    return links.length ? links : ['- No published entries yet.'];
  };

  return [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    `${company.description} Mission: ${company.mission}`,
    '',
    `Research areas: ${company.researchAreas.join('; ')}.`,
    '',
    'Research notes separate measured results from pre-registered targets and state the provenance of every figure.',
    '',
    `- Website: ${SITE.url}`,
    `- Founder: Sayan Chowdhury (${SITE.founderLinkedin})`,
    `- Contact: ${SITE.email}`,
    `- GitHub: ${SITE.githubUrl}`,
    '',
    'Every page listed here is Markdown. Any HTML page on the site also answers with Markdown when requested with `Accept: text/markdown`, or at its path plus `.md`.',
    '',
    '## Pages',
    '',
    ...SITE_PAGES.map(pageLink),
    '',
    '## Research',
    '',
    ...linksFor('research'),
    '',
    '## Blog',
    '',
    ...linksFor('blog'),
    '',
    '## FAQ',
    '',
    ...FAQS.flatMap((faq) => [`### ${faq.question}`, '', faq.answer, '']),
    '## Optional',
    '',
    `- [Full text archive](${absoluteSiteUrl('/llms-full.txt')}): Every page, note, and post in one file.`,
    ...LEGAL_PAGES.map(pageLink),
    `- [RSS: all posts](${absoluteSiteUrl('/rss.xml')}): Research and blog feed.`,
    `- [RSS: research](${absoluteSiteUrl('/research/rss.xml')}): Research notes only.`,
    `- [RSS: blog](${absoluteSiteUrl('/blog/rss.xml')}): Engineering posts only.`,
    `- [Sitemap](${absoluteSiteUrl('/sitemap-index.xml')})`,
    '',
    'Content may be used for search and AI answers with attribution to the canonical URL. It may not be used for model training.',
    '',
  ].join('\n');
}

/**
 * Index plus every article as nested Markdown. Article headings are demoted
 * one level so each article is a single `##` section. The build step
 * (integrations/markdown-twins.mjs) appends the non-article pages and token
 * counts.
 */
export function buildLlmsFullTxt(entries: DiscoveryEntry[]) {
  const content = entries.map(({ collection, entry }) =>
    shiftHeadings(buildEntryMarkdown(collection, entry).trim(), 1),
  );

  return (
    [
      buildLlmsTxt(entries).trim(),
      '---',
      '# Complete Published Text Archive',
      ...content,
    ].join('\n\n') + '\n'
  );
}
