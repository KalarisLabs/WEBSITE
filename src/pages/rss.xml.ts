import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { entryPath, getPublishedEntries } from '../lib/content';

export const prerender = true;
export const GET: APIRoute = async (context) => {
  const [blog, research] = await Promise.all([
    getPublishedEntries('blog'),
    getPublishedEntries('research'),
  ]);
  const items = [
    ...blog.map((entry) => ({ entry, collection: 'blog' as const })),
    ...research.map((entry) => ({ entry, collection: 'research' as const })),
  ].sort(
    (a, b) =>
      b.entry.data.publishDate.valueOf() - a.entry.data.publishDate.valueOf(),
  );

  return rss({
    title: 'Kalaris Labs',
    description:
      'Engineering, research, and company updates from Kalaris Labs.',
    site: context.site ?? 'https://kalarislabs.com',
    items: items.map(({ entry, collection }) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishDate,
      link: entryPath(collection, entry),
      categories: entry.data.tags,
    })),
  });
};
