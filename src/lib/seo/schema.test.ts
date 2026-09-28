import { describe, expect, it } from 'vitest';
import {
  buildArticleSchema,
  buildOrganizationSchema,
  serializeJsonLd,
} from './schema';

describe('SEO structured data', () => {
  it('builds a canonical organization entity', () => {
    expect(buildOrganizationSchema()).toMatchObject({
      '@type': 'Organization',
      '@id': 'https://kalarislabs.com/#organization',
      url: 'https://kalarislabs.com',
    });
  });

  it('builds research entries as TechArticle entities', () => {
    expect(
      buildArticleSchema({
        title: 'Edge delivery',
        description: 'Research note',
        url: 'https://kalarislabs.com/research/edge-delivery',
        publishDate: new Date('2026-09-27T00:00:00.000Z'),
        section: 'Research',
      }),
    ).toMatchObject({
      '@type': 'TechArticle',
      datePublished: '2026-09-27T00:00:00.000Z',
      dateModified: '2026-09-27T00:00:00.000Z',
    });
  });

  it('escapes markup in JSON-LD script content', () => {
    expect(serializeJsonLd({ value: '</script>' })).not.toContain('</script>');
  });
});
