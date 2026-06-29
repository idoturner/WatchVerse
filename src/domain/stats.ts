import { STATUS_ORDER } from './status';
import type { LibraryEntry, WatchStatus } from './types';

/**
 * Rough watch-hour estimates. The library snapshot intentionally does NOT store
 * runtimes/episode counts (Data Models §1), so watch hours are *estimates* using
 * simple, documented constants rather than precise data.
 */
export const AVG_MOVIE_HOURS = 2;
export const AVG_SHOW_HOURS = 12;

export interface RatingBucket {
  rating: number; // 1..10
  count: number;
}

export interface LibraryStats {
  totalTracked: number;
  moviesWatched: number; // completed movies
  showsWatched: number; // completed shows (Completed only)
  totalCompleted: number;
  estimatedWatchHours: number; // includes rewatches
  completionPercentage: number; // 0..100
  statusBreakdown: Record<WatchStatus, number>;
  averageRating: number | null;
  topMovies: LibraryEntry[]; // up to 3, by personal rating
  topShows: LibraryEntry[]; // up to 3, by personal rating
  ratingsDistribution: RatingBucket[]; // buckets 1..10
  recentlyCompleted: LibraryEntry[]; // up to 6, most recent first
}

function emptyBreakdown(): Record<WatchStatus, number> {
  return STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<WatchStatus, number>,
  );
}

function topRated(entries: LibraryEntry[], limit = 3): LibraryEntry[] {
  return entries
    .filter((e) => e.rating !== null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}

/** Pure: derive all dashboard statistics from the library. Never persisted. */
export function computeStats(entries: LibraryEntry[]): LibraryStats {
  const statusBreakdown = emptyBreakdown();
  let estimatedWatchHours = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  const ratingsDistribution: RatingBucket[] = Array.from({ length: 10 }, (_, i) => ({
    rating: i + 1,
    count: 0,
  }));

  for (const entry of entries) {
    statusBreakdown[entry.status] += 1;

    const completed = entry.status === 'completed';
    if (completed) {
      const watches = 1 + entry.rewatchCount;
      estimatedWatchHours +=
        (entry.mediaType === 'movie' ? AVG_MOVIE_HOURS : AVG_SHOW_HOURS) * watches;
    }

    if (entry.rating !== null) {
      ratingSum += entry.rating;
      ratingCount += 1;
      const bucket = ratingsDistribution[Math.round(entry.rating) - 1];
      if (bucket) bucket.count += 1;
    }
  }

  const movies = entries.filter((e) => e.mediaType === 'movie');
  const shows = entries.filter((e) => e.mediaType === 'tv');
  const moviesWatched = movies.filter((e) => e.status === 'completed').length;
  const showsWatched = shows.filter((e) => e.status === 'completed').length;
  const totalCompleted = moviesWatched + showsWatched;

  const recentlyCompleted = entries
    .filter((e) => e.status === 'completed')
    .sort((a, b) => (b.watchedAt ?? '').localeCompare(a.watchedAt ?? ''))
    .slice(0, 6);

  return {
    totalTracked: entries.length,
    moviesWatched,
    showsWatched,
    totalCompleted,
    estimatedWatchHours,
    completionPercentage:
      entries.length === 0 ? 0 : Math.round((totalCompleted / entries.length) * 100),
    statusBreakdown,
    averageRating: ratingCount === 0 ? null : Number((ratingSum / ratingCount).toFixed(1)),
    topMovies: topRated(movies),
    topShows: topRated(shows),
    ratingsDistribution,
    recentlyCompleted,
  };
}
