import { describe, expect, it } from 'vitest';
import { getPersonStats, type AuthoredEntry } from './people';

const entry = (over: Partial<AuthoredEntry>): AuthoredEntry => ({
  collection: 'blog',
  id: 'a',
  title: 'A',
  description: 'd',
  publishDate: new Date('2026-09-01'),
  tags: ['security'],
  authors: ['sayan-chowdhury'],
  wordCount: 440,
  ...over,
});

describe('getPersonStats', () => {
  it('counts only the person’s entries, newest first', () => {
    const stats = getPersonStats('sayan-chowdhury', [
      entry({ id: 'old' }),
      entry({
        id: 'new',
        collection: 'research',
        publishDate: new Date('2026-09-20'),
        tags: ['security', 'agents'],
      }),
      entry({ id: 'other', authors: ['adyan-rehman'] }),
    ]);
    expect(stats.total).toBe(2);
    expect(stats.posts).toBe(1);
    expect(stats.researchNotes).toBe(1);
    expect(stats.entries.map((e) => e.id)).toEqual(['new', 'old']);
    expect(stats.readingMinutes).toBe(4);
    expect(stats.topics).toEqual(['security', 'agents']);
    expect(stats.firstPublished).toEqual(new Date('2026-09-01'));
  });

  it('returns zeros for a person with no writing', () => {
    const stats = getPersonStats('adyan-rehman', [entry({})]);
    expect(stats).toMatchObject({ total: 0, words: 0, readingMinutes: 0 });
    expect(stats.firstPublished).toBeUndefined();
  });
});
