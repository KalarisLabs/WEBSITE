import type { APIRoute } from 'astro';
import { entryPath, getPublishedEntries } from '../lib/content';
import { absoluteSiteUrl } from '../lib/seo/site';

export const prerender = true;

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async () => {
  const [blog, research] = await Promise.all([
    getPublishedEntries('blog'),
    getPublishedEntries('research'),
  ]);
  const entries = [
    ...blog.map((entry) => ({ entry, collection: 'blog' as const })),
    ...research.map((entry) => ({ entry, collection: 'research' as const })),
  ];

  const urls = entries.map(({ entry, collection }) => {
    const location = absoluteSiteUrl(entryPath(collection, entry));
    const lastModified = entry.data.updatedDate ?? entry.data.publishDate;
    const image = entry.data.socialImage
      ? `\n    <image:image>\n      <image:loc>${escapeXml(absoluteSiteUrl(entry.data.socialImage))}</image:loc>\n      <image:title>${escapeXml(entry.data.title)}</image:title>\n    </image:image>`
      : '';

    return `  <url>\n    <loc>${escapeXml(location)}</loc>\n    <lastmod>${lastModified.toISOString()}</lastmod>${image}\n  </url>`;
  });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
