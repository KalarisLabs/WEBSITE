import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedEntries } from '../../lib/content';
import { OG_IMAGE_TYPE, PAGE_OG_SOURCES } from '../../lib/seo/og';
import { renderCoverImage, renderSiteImage } from '../../lib/seo/og-render';

export const prerender = true;

type Props = { source: string | null };

export const getStaticPaths = (async () => {
  const [blog, research] = await Promise.all([
    getPublishedEntries('blog'),
    getPublishedEntries('research'),
  ]);
  const entries = [
    ...blog.map((entry) => ['blog', entry] as const),
    ...research.map((entry) => ['research', entry] as const),
  ];

  return [
    { params: { path: 'default.jpg' }, props: { source: null } },
    ...Object.entries(PAGE_OG_SOURCES).map(([key, source]) => ({
      params: { path: `${key}.jpg` },
      props: { source },
    })),
    ...entries.flatMap(([collection, entry]) =>
      entry.data.socialImage
        ? [
            {
              params: { path: `${collection}/${entry.id}.jpg` },
              props: { source: entry.data.socialImage },
            },
          ]
        : [],
    ),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props }) => {
  const image = props.source
    ? await renderCoverImage(props.source)
    : await renderSiteImage();
  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': OG_IMAGE_TYPE,
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
