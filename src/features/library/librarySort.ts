import type { LibraryEntry, SortKey, WatchStatus } from '@/domain/types';

export type StatusFilter = WatchStatus | 'all';

export function filterEntriesByStatus(
  entries: LibraryEntry[],
  status: StatusFilter,
): LibraryEntry[] {
  return status === 'all' ? entries : entries.filter((entry) => entry.status === status);
}

export function filterEntriesByTag(entries: LibraryEntry[], tagId: string | 'all'): LibraryEntry[] {
  return tagId === 'all' ? entries : entries.filter((entry) => entry.tagIds.includes(tagId));
}

/** Pure sort of library entries. Returns a new array. */
export function sortEntries(entries: LibraryEntry[], sortKey: SortKey): LibraryEntry[] {
  const copy = [...entries];
  switch (sortKey) {
    case 'az':
      return copy.sort((a, b) => a.snapshot.title.localeCompare(b.snapshot.title));
    case 'za':
      return copy.sort((a, b) => b.snapshot.title.localeCompare(a.snapshot.title));
    case 'newest':
      return copy.sort((a, b) => (b.snapshot.releaseYear ?? 0) - (a.snapshot.releaseYear ?? 0));
    case 'oldest':
      return copy.sort(
        (a, b) =>
          (a.snapshot.releaseYear ?? Number.POSITIVE_INFINITY) -
          (b.snapshot.releaseYear ?? Number.POSITIVE_INFINITY),
      );
    case 'rating':
      return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case 'date_added':
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
