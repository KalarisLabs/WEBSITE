export interface AuthoredEntry {
  collection: 'blog' | 'research';
  id: string;
  title: string;
  description: string;
  publishDate: Date;
  tags: readonly string[];
  authors: readonly string[];
  wordCount: number;
  socialImage?: string | undefined;
}

export interface PersonStats {
  posts: number;
  researchNotes: number;
  total: number;
  words: number;
  readingMinutes: number;
  topics: string[];
  firstPublished?: Date;
  latestPublished?: Date;
  entries: AuthoredEntry[];
}

const WORDS_PER_MINUTE = 220;

export function countWords(body: string | undefined) {
  return body ? body.trim().split(/\s+/).filter(Boolean).length : 0;
}

/** Publishing metrics for one person, newest entry first. */
export function getPersonStats(
  slug: string,
  all: readonly AuthoredEntry[],
): PersonStats {
  const entries = all
    .filter((entry) => entry.authors.includes(slug))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf());
  const words = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const tagCounts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const topics = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
  const posts = entries.filter((entry) => entry.collection === 'blog').length;
  const stats: PersonStats = {
    posts,
    researchNotes: entries.length - posts,
    total: entries.length,
    words,
    readingMinutes: entries.length
      ? Math.max(1, Math.round(words / WORDS_PER_MINUTE))
      : 0,
    topics,
    entries,
  };
  if (entries.length) {
    stats.latestPublished = entries[0]!.publishDate;
    stats.firstPublished = entries[entries.length - 1]!.publishDate;
  }
  return stats;
}
