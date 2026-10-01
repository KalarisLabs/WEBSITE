import { describe, expect, it } from 'vitest';
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildFounderPersonSchema,
  buildOrganizationSchema,
  buildProfilePageSchema,
  serializeJsonLd,
} from './schema';

describe('SEO structured data', () => {
  it('builds a canonical organization entity with founder and social references', () => {
    const org = buildOrganizationSchema();
    expect(org).toMatchObject({
      '@type': 'Organization',
      '@id': 'https://kalarislabs.com/#organization',
      url: 'https://kalarislabs.com',
    });
    expect(org.sameAs).toBeInstanceOf(Array);
    expect(org.founder).toMatchObject({
      '@type': 'Person',
      name: 'Sayan Chowdhury',
    });
  });

  it('builds a founder Person entity for knowledge graph grounding', () => {
    const person = buildFounderPersonSchema();
    expect(person).toMatchObject({
      '@type': 'Person',
      '@id': 'https://kalarislabs.com/team/sayan-chowdhury#person',
      url: 'https://kalarislabs.com/team/sayan-chowdhury',
      name: 'Sayan Chowdhury',
      jobTitle: 'Founder',
    });
    // The organization's founder reference resolves to the same entity.
    expect(buildOrganizationSchema().founder).toMatchObject({
      '@id': person['@id'],
    });
  });

  it('wraps a person in a ProfilePage without empty sameAs', () => {
    const page = buildProfilePageSchema({
      slug: 'jane-doe',
      name: 'Jane Doe',
      role: 'Team',
      summary: 'Member of the team.',
      socials: [],
    });
    expect(page).toMatchObject({
      '@type': 'ProfilePage',
      url: 'https://kalarislabs.com/team/jane-doe',
      mainEntity: {
        '@type': 'Person',
        '@id': 'https://kalarislabs.com/team/jane-doe#person',
      },
    });
    expect((page.mainEntity as Record<string, unknown>).sameAs).toBeUndefined();
    expect(page.mainEntity).not.toHaveProperty('@context');
  });

  it('lists every author as a separate Person linked to their profile', () => {
    const article = buildArticleSchema({
      title: 'Post',
      description: 'Blog post',
      url: 'https://kalarislabs.com/blog/post',
      publishDate: new Date('2026-09-27T00:00:00.000Z'),
      section: 'Blog',
      authors: [
        { slug: 'sayan-chowdhury', name: 'Sayan Chowdhury' },
        { slug: 'jane-doe', name: 'Jane Doe' },
      ],
    });
    expect(article.author).toEqual([
      expect.objectContaining({
        '@id': 'https://kalarislabs.com/team/sayan-chowdhury#person',
      }),
      expect.objectContaining({
        '@id': 'https://kalarislabs.com/team/jane-doe#person',
        url: 'https://kalarislabs.com/team/jane-doe',
      }),
    ]);
  });

  it('types the manifesto as a plain Article, not research', () => {
    const article = buildArticleSchema({
      title: 'Manifesto',
      description: 'Manifesto',
      url: 'https://kalarislabs.com/manifesto',
      publishDate: new Date('2026-01-01T00:00:00.000Z'),
      section: 'Manifesto',
    });
    expect(article['@type']).toBe('Article');
    expect(article.additionalType).toBeUndefined();
  });

  it('builds research entries as TechArticle / ScholarlyArticle entities', () => {
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
      additionalType: 'https://schema.org/ScholarlyArticle',
      datePublished: '2026-09-27T00:00:00.000Z',
      dateModified: '2026-09-27T00:00:00.000Z',
    });
  });

  it('builds BreadcrumbList schema', () => {
    const breadcrumbs = buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Research', url: '/research' },
      { name: 'Edge Delivery', url: '/research/edge-delivery' },
    ]);
    expect(breadcrumbs).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home' },
        { '@type': 'ListItem', position: 2, name: 'Research' },
        { '@type': 'ListItem', position: 3, name: 'Edge Delivery' },
      ],
    });
  });

  it('builds FAQPage schema for answer engine optimization', () => {
    const faq = buildFaqSchema([
      {
        question: 'What is Kalaris Labs?',
        answer:
          'Kalaris Labs builds recursive, self-improving infrastructure for scientific research.',
      },
    ]);
    expect(faq).toMatchObject({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Kalaris Labs?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Kalaris Labs builds recursive, self-improving infrastructure for scientific research.',
          },
        },
      ],
    });
  });

  it('escapes markup in JSON-LD script content', () => {
    expect(serializeJsonLd({ value: '</script>' })).not.toContain('</script>');
  });
});
