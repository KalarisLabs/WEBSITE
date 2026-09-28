import {
  getCollection,
  type CollectionEntry,
  type CollectionKey,
} from 'astro:content';

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
