import type { SortKey, TmdbTitle } from '@/domain/types';

/** Pure client-side filter applied to search results (TMDB search ignores genre/year). */
export function filterTitles(
  titles: TmdbTitle[],
  filters: { genreId: number | null; year: number | null },
): TmdbTitle[] {
  return titles.filter(
    (title) =>
      (filters.genreId === null || title.genreIds.includes(filters.genreId)) &&
      (filters.year === null || title.releaseYear === filters.year),
  );
}

/** Pure client-side sort. Returns a new array; `date_added` is a no-op here (library-only). */
export function sortTitles(titles: TmdbTitle[], sortKey: SortKey): TmdbTitle[] {
  const copy = [...titles];
  switch (sortKey) {
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'za':
      return copy.sort((a, b) => b.title.localeCompare(a.title));
    case 'newest':
      return copy.sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0));
    case 'oldest':
      return copy.sort(
        (a, b) =>
          (a.releaseYear ?? Number.POSITIVE_INFINITY) - (b.releaseYear ?? Number.POSITIVE_INFINITY),
      );
    case 'rating':
      return copy.sort((a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0));
    default:
      return copy;
  }
}
