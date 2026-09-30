import rss from '@astrojs/rss';
import {
  entryPath,
  getPublishedEntries,
  type PublishingCollection,
} from '../content';
import { absoluteSiteUrl, SITE } from './site';

const AUTHOR = 'Sayan Chowdhury';

const FEED_META: Record<
  PublishingCollection | 'all',
  { title: string; description: string; path: string }
> = {
  all: {
    title: 'Kalaris Labs',
    description: 'Research notes and engineering posts from Kalaris Labs.',
    path: '/rss.xml',
  },
  research: {
    title: 'Kalaris Labs Research',
    description:
      'Research on agents, multi-agent systems, and AI safety from Kalaris Labs.',
    path: '/research/rss.xml',
  },
  blog: {
    title: 'Kalaris Labs Blog',
    description: 'Engineering posts from Kalaris Labs.',
    path: '/blog/rss.xml',
  },
};

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function buildFeed(scope: PublishingCollection | 'all') {
  const collections: PublishingCollection[] =
    scope === 'all' ? ['research', 'blog'] : [scope];
  const groups = await Promise.all(
    collections.map(async (collection) =>
      (await getPublishedEntries(collection)).map((entry) => ({
        collection,
        entry,
      })),
    ),
  );
  const items = groups
    .flat()
    .sort(
      (a, b) =>
        b.entry.data.publishDate.valueOf() - a.entry.data.publishDate.valueOf(),
    );
  const meta = FEED_META[scope];
  const feedUrl = absoluteSiteUrl(meta.path);

  return rss({
    title: meta.title,
    description: meta.description,
    site: SITE.url,
    trailingSlash: false,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
      dc: 'http://purl.org/dc/elements/1.1/',
      media: 'http://search.yahoo.com/mrss/',
    },
    customData: [
      `<language>en</language>`,
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>`,
      `<image><url>${absoluteSiteUrl('/apple-touch-icon.png')}</url><title>${escapeXml(meta.title)}</title><link>${SITE.url}</link></image>`,
      items[0]
        ? `<lastBuildDate>${(items[0].entry.data.updatedDate ?? items[0].entry.data.publishDate).toUTCString()}</lastBuildDate>`
        : '',
    ].join(''),
    items: items.map(({ entry, collection }) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishDate,
      link: entryPath(collection, entry),
      categories: [
        collection === 'research' ? 'Research' : 'Blog',
        ...entry.data.tags,
      ],
      customData: [
        `<dc:creator>${AUTHOR}</dc:creator>`,
        entry.data.socialImage
          ? `<media:content url="${escapeXml(absoluteSiteUrl(entry.data.socialImage))}" medium="image"/>`
          : '',
      ].join(''),
    })),
  });
}

export { buildEntryMarkdown } from './discovery';

export const MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'Cache-Control': 'public, max-age=0, must-revalidate',
};
