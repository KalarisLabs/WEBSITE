import { describe, expect, it } from 'vitest';
import {
  entryOgImage,
  isGeneratedOgImage,
  PAGE_OG_SOURCES,
  pageOgImage,
} from './og';
import { SITE } from './site';

describe('social share images', () => {
  it('uses a post cover when the post has one', () => {
    const entry = { id: 'skill-doctor', data: { socialImage: '/cover.webp' } };
    expect(entryOgImage('research', entry)).toBe(
      '/og/research/skill-doctor.jpg',
    );
  });

  it('falls back to the site image without a cover', () => {
    const entry = { id: 'draft-note', data: {} };
    expect(entryOgImage('blog', entry)).toBe(SITE.socialImagePath);
  });

  it('gives each registered page its own generated image', () => {
    expect(pageOgImage('fellowship')).toBe('/og/fellowship.jpg');
    expect(Object.keys(PAGE_OG_SOURCES)).toEqual(['fellowship', 'careers']);
  });

  it('treats only /og/*.jpg as generated at the standard size', () => {
    expect(isGeneratedOgImage(SITE.socialImagePath)).toBe(true);
    expect(isGeneratedOgImage('/og/blog/post.jpg')).toBe(true);
    expect(isGeneratedOgImage('/images/content/1.jpg')).toBe(false);
  });
});
