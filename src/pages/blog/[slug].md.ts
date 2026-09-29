import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedEntries, type PublishingEntry } from '../../lib/content';
import { buildEntryMarkdown, MARKDOWN_HEADERS } from '../../lib/seo/feeds';

export const prerender = true;

export const getStaticPaths = (async () =>
  (await getPublishedEntries('blog')).map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: PublishingEntry }> = ({ props }) =>
  new Response(buildEntryMarkdown('blog', props.entry), {
    headers: MARKDOWN_HEADERS,
  });
