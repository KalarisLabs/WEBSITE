import { SITE } from './site';

/**
 * Social share images. Every image is rendered at build time by
 * src/pages/og/[...path].ts into a 1200x630 JPEG, the size and format that
 * X, LinkedIn, Facebook, Slack, Discord, WhatsApp, and iMessage all render.
 */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_IMAGE_TYPE = 'image/jpeg';

/** Page-level share images, keyed by output name, from files in public/. */
export const PAGE_OG_SOURCES = {
  fellowship: '/fellowship/fellowship-og.jpg',
  careers: '/images/careers-graphic.png',
} as const;

export type PageOgKey = keyof typeof PAGE_OG_SOURCES;

export function pageOgImage(key: PageOgKey) {
  return `/og/${key}.jpg`;
}

/** A post's share image is its own cover, or the site image without one. */
export function entryOgImage(
  collection: 'blog' | 'research',
  entry: { id: string; data: { socialImage?: string | undefined } },
) {
  return entry.data.socialImage
    ? `/og/${collection}/${entry.id}.jpg`
    : SITE.socialImagePath;
}

export function isGeneratedOgImage(path: string) {
  return path.startsWith('/og/') && path.endsWith('.jpg');
}
