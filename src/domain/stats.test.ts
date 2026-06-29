import { describe, expect, it } from 'vitest';
import { createLibraryEntry } from './library';
import { computeStats } from './stats';
import type { LibraryEntry, MediaType, WatchStatus } from './types';

function entry(opts: {
  title: string;
  mediaType?: MediaType;
  status?: WatchStatus;
  rating?: number | null;
  rewatch?: number;
  watchedAt?: string | null;
}): LibraryEntry {
  const base = createLibraryEntry({
    tmdbId: Math.floor(Math.random() * 1e6),
    mediaType: opts.mediaType ?? 'movie',
    snapshot: { title: opts.title, posterPath: null, releaseYear: 2020 },
  });
  return {
    ...base,
    status: opts.status ?? 'want',
    rating: opts.rating ?? null,
    rewatchCount: opts.rewatch ?? 0,
    watchedAt: opts.watchedAt ?? null,
  };
}

describe('computeStats', () => {
  it('returns zeros for an empty library', () => {
    const s = computeStats([]);
    expect(s.totalTracked).toBe(0);
    expect(s.totalCompleted).toBe(0);
    expect(s.estimatedWatchHours).toBe(0);
    expect(s.completionPercentage).toBe(0);
    expect(s.averageRating).toBeNull();
    expect(s.topMovies).toEqual([]);
  });

  it('computes counts, hours, completion, ratings, and top lists', () => {
    const entries = [
      entry({
        title: 'M1',
        mediaType: 'movie',
        status: 'completed',
        rating: 9,
        rewatch: 1,
        watchedAt: '2021-01-01',
      }),
      entry({ title: 'M2', mediaType: 'movie', status: 'completed', rating: 8 }),
      entry({ title: 'M3', mediaType: 'movie', status: 'want' }),
      entry({
        title: 'S1',
        mediaType: 'tv',
        status: 'completed',
        rating: 7,
        watchedAt: '2022-01-01',
      }),
      entry({ title: 'S2', mediaType: 'tv', status: 'watching' }),
    ];
    const s = computeStats(entries);

    expect(s.moviesWatched).toBe(2);
    expect(s.showsWatched).toBe(1);
    expect(s.totalCompleted).toBe(3);
    expect(s.estimatedWatchHours).toBe(18); // M1 2*(1+1)=4, M2 2, S1 12
    expect(s.completionPercentage).toBe(60); // 3/5
    expect(s.statusBreakdown.completed).toBe(3);
    expect(s.statusBreakdown.want).toBe(1);
    expect(s.averageRating).toBe(8);
    expect(s.topMovies.map((e) => e.snapshot.title)).toEqual(['M1', 'M2']);
    expect(s.topShows.map((e) => e.snapshot.title)).toEqual(['S1']);
    expect(s.ratingsDistribution.find((b) => b.rating === 9)?.count).toBe(1);
    expect(s.recentlyCompleted[0]?.snapshot.title).toBe('S1'); // most recent watchedAt
  });
});
