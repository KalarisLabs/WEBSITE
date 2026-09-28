import type { PublishingCollection, PublishingEntry } from '../content';
import { entryPath } from '../content';
import { absoluteSiteUrl, CONTENT_SIGNAL, SITE } from './site';

export interface DiscoveryEntry {
  collection: PublishingCollection;
  entry: PublishingEntry;
}

export function buildRobotsTxt() {
  return [
    'User-agent: *',
    `Content-signal: ${CONTENT_SIGNAL}`,
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${absoluteSiteUrl('/sitemap-index.xml')}`,
    `Host: ${new URL(SITE.url).hostname}`,
    '',
  ].join('\n');
}

export function buildLlmsTxt(entries: DiscoveryEntry[]) {
  const sections = (['blog', 'research'] as const).map((collection) => {
    const label = collection === 'blog' ? 'Blog' : 'Research';
    const links = entries
      .filter((item) => item.collection === collection)
      .map(
        ({ entry }) =>
          `- [${entry.data.title}](${absoluteSiteUrl(entryPath(collection, entry))}): ${entry.data.description}`,
      );
    return [
      `## ${label}`,
      '',
      ...(links.length ? links : ['- No published entries yet.']),
    ].join('\n');
  });

  return [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    'Kalaris Labs publishes engineering notes, applied research, and company updates. Use canonical links when citing this website.',
    '',
    '## Primary links',
    '',
    `- [Home](${SITE.url}/): Company overview and contact information.`,
    `- [Blog](${absoluteSiteUrl('/blog')}): Engineering notes and company updates.`,
    `- [Research](${absoluteSiteUrl('/research')}): Research notes on software and emerging technology.`,
    `- [RSS](${absoluteSiteUrl('/rss.xml')}): Combined feed for blog and research.`,
    `- [Documentation](${SITE.docsUrl}): Product and technical documentation.`,
    '',
    ...sections.flatMap((section) => [section, '']),
    '',
    '## Usage',
    '',
    '- Search indexing and AI-assisted retrieval are permitted.',
    '- Model training is not permitted.',
    `- Contact: ${SITE.email}`,
    '',
  ].join('\n');
}

export function buildLlmsFullTxt(entries: DiscoveryEntry[]) {
  const content = entries.map(({ collection, entry }) => {
    const url = absoluteSiteUrl(entryPath(collection, entry));
    const source =
      'body' in entry && typeof entry.body === 'string'
        ? entry.body.trim()
        : '';
    return [
      `# ${entry.data.title}`,
      '',
      `Canonical URL: ${url}`,
      `Section: ${collection === 'blog' ? 'Blog' : 'Research'}`,
      `Published: ${entry.data.publishDate.toISOString()}`,
      ...(entry.data.updatedDate
        ? [`Updated: ${entry.data.updatedDate.toISOString()}`]
        : []),
      `Description: ${entry.data.description}`,
      `Tags: ${entry.data.tags.join(', ') || 'None'}`,
      '',
      source || entry.data.description,
    ].join('\n');
  });

  return (
    [buildLlmsTxt(entries).trim(), '# Published content', ...content].join(
      '\n\n',
    ) + '\n'
  );
}
