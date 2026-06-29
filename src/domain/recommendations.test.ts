import { describe, expect, it } from 'vitest';
import { createLibraryEntry } from './library';
import { combineRecommendations, pickSeedEntries } from './recommendations';
import type { LibraryEntry, TmdbTitle, WatchStatus } from './types';

function entry(opts: {
  title?: string;
  status?: WatchStatus;
  rating?: number | null;
}): LibraryEntry {
  const base = createLibraryEntry({
    tmdbId: Math.floor(Math.random() * 1e6),
    mediaType: 'movie',
    snapshot: { title: opts.title ?? 'T', posterPath: null, releaseYear: 2020 },
  });
  return { ...base, status: opts.status ?? 'want', rating: opts.rating ?? null };
}

function title(id: number, vote = 5): TmdbTitle {
  return {
    tmdbId: id,
    mediaType: 'movie',
    title: `T${id}`,
    overview: '',
    posterPath: null,
    backdropPath: null,
    releaseYear: 2020,
    releaseDate: '2020-01-01',
    voteAverage: vote,
    genreIds: [],
  };
}

describe('pickSeedEntries', () => {
  it('selects completed or highly-rated entries, highest-rated first', () => {
    const seeds = pickSeedEntries(
      [
        entry({ title: 'a', status: 'want' }),
        entry({ title: 'b', status: 'completed' }),
        entry({ title: 'c', rating: 9 }),
        entry({ title: 'd', rating: 5 }),
      ],
      3,
    );
    expect(seeds.map((s) => s.snapshot.title)).toEqual(['c', 'b']);
  });
});

describe('combineRecommendations', () => {
  it('aggregates, excludes library, ranks by count then rating, and adds a reason', () => {
    const library = new Set(['movie:1']);
    const groups = [
      { seedTitle: 'Seed A', titles: [title(1), title(2, 8), title(3, 6)] },
      { seedTitle: 'Seed B', titles: [title(2, 8), title(4, 9)] },
    ];
    const recs = combineRecommendations(groups, library, 10);
    expect(recs.map((r) => r.title.tmdbId)).toEqual([2, 4, 3]);
    expect(recs[0]?.reason).toBe('Because you liked Seed A');
  });
});
