import type { APIRoute } from 'astro';
import { getPublishedEntries } from '../lib/content';
import { buildLlmsFullTxt } from '../lib/seo/discovery';

export const prerender = true;

export const GET: APIRoute = async () => {
  const [blog, research] = await Promise.all([
    getPublishedEntries('blog'),
    getPublishedEntries('research'),
  ]);
  const body = buildLlmsFullTxt([
    ...blog.map((entry) => ({ collection: 'blog' as const, entry })),
    ...research.map((entry) => ({ collection: 'research' as const, entry })),
  ]);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
