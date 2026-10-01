import {
  getCollection,
  type CollectionEntry,
  type CollectionKey,
} from 'astro:content';
import { countWords, type AuthoredEntry } from './people';

export type PublishingCollection = Extract<CollectionKey, 'blog' | 'research'>;
export type PublishingEntry = CollectionEntry<PublishingCollection>;

export async function getPublishedEntries<C extends PublishingCollection>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(
    collection,
    ({ data }) => !data.draft || import.meta.env.DEV,
  );
  return entries.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
}

export function entryPath(
  collection: PublishingCollection,
  entry: PublishingEntry,
) {
  return `/${collection}/${entry.id}`;
}

/**
 * Inline style that pairs an entry's cover image across pages so the browser
 * morphs the card thumbnail into the article banner on navigation. Names must
 * be unique per page, so render it on at most one cover per entry.
 */
export function coverTransitionStyle(
  collection: PublishingCollection,
  entry: PublishingEntry,
) {
  if (!entry.data.socialImage) return undefined;
  const name = `cover-${collection}-${entry.id}`.replace(
    /[^a-zA-Z0-9_-]/g,
    '-',
  );
  return `view-transition-name: ${name}; view-transition-class: cover;`;
}

/** Every published post and research note, flattened for author metrics. */
export async function getAuthoredEntries(): Promise<AuthoredEntry[]> {
  const collections: PublishingCollection[] = ['blog', 'research'];
  const groups = await Promise.all(
    collections.map(async (collection) =>
      (await getPublishedEntries(collection)).map((entry): AuthoredEntry => ({
        collection,
        id: entry.id,
        title: entry.data.title,
        description: entry.data.description,
        publishDate: entry.data.publishDate,
        tags: entry.data.tags,
        authors: entry.data.authors,
        wordCount: countWords(entry.body),
        socialImage: entry.data.socialImage,
      })),
    ),
  );
  return groups.flat();
}
