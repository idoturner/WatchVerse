import type { LibraryEntry, TmdbTitle } from './types';

export interface Recommendation {
  title: TmdbTitle;
  reason: string;
}

/**
 * Pick "seed" titles to base recommendations on: the user's strongest signals —
 * completed titles or those rated ≥ 7 — highest-rated first. Pure.
 */
export function pickSeedEntries(entries: LibraryEntry[], limit = 3): LibraryEntry[] {
  return entries
    .filter((entry) => entry.status === 'completed' || (entry.rating !== null && entry.rating >= 7))
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}

/**
 * Combine per-seed recommendation lists into a ranked, deduplicated set: exclude
 * titles already in the library, rank by how many seeds recommend a title (then by
 * TMDB rating), and attach a transparent reason. Pure.
 */
export function combineRecommendations(
  groups: { seedTitle: string; titles: TmdbTitle[] }[],
  libraryKeys: Set<string>,
  limit = 18,
): Recommendation[] {
  const tally = new Map<string, { title: TmdbTitle; reason: string; count: number }>();

  for (const group of groups) {
    for (const title of group.titles) {
      const key = `${title.mediaType}:${title.tmdbId}`;
      if (libraryKeys.has(key)) continue;
      const existing = tally.get(key);
      if (existing) existing.count += 1;
      else tally.set(key, { title, reason: `Because you liked ${group.seedTitle}`, count: 1 });
    }
  }

  return [...tally.values()]
    .sort((a, b) => b.count - a.count || (b.title.voteAverage ?? 0) - (a.title.voteAverage ?? 0))
    .slice(0, limit)
    .map(({ title, reason }) => ({ title, reason }));
}
