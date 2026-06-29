import { describe, expect, it } from 'vitest';
import type { TmdbTitle } from '@/domain/types';
import { filterTitles, sortTitles } from './filtering';

function title(partial: Partial<TmdbTitle> & { tmdbId: number }): TmdbTitle {
  return {
    tmdbId: partial.tmdbId,
    mediaType: partial.mediaType ?? 'movie',
    title: partial.title ?? 'Title',
    overview: '',
    posterPath: null,
    backdropPath: null,
    releaseYear: partial.releaseYear ?? null,
    releaseDate: partial.releaseDate ?? null,
    voteAverage: partial.voteAverage ?? null,
    genreIds: partial.genreIds ?? [],
  };
}

describe('filterTitles', () => {
  const titles = [
    title({ tmdbId: 1, genreIds: [28], releaseYear: 2020 }),
    title({ tmdbId: 2, genreIds: [18], releaseYear: 2021 }),
    title({ tmdbId: 3, genreIds: [28, 18], releaseYear: 2020 }),
  ];

  it('returns all titles when no filters are set', () => {
    expect(filterTitles(titles, { genreId: null, year: null })).toHaveLength(3);
  });

  it('filters by genre', () => {
    const result = filterTitles(titles, { genreId: 28, year: null });
    expect(result.map((t) => t.tmdbId)).toEqual([1, 3]);
  });

  it('filters by year', () => {
    const result = filterTitles(titles, { genreId: null, year: 2021 });
    expect(result.map((t) => t.tmdbId)).toEqual([2]);
  });

  it('combines genre and year', () => {
    const result = filterTitles(titles, { genreId: 18, year: 2020 });
    expect(result.map((t) => t.tmdbId)).toEqual([3]);
  });
});

describe('sortTitles', () => {
  const titles = [
    title({ tmdbId: 1, title: 'Bravo', releaseYear: 2000, voteAverage: 6 }),
    title({ tmdbId: 2, title: 'Alpha', releaseYear: 2020, voteAverage: 9 }),
    title({ tmdbId: 3, title: 'Charlie', releaseYear: 2010, voteAverage: 7 }),
  ];

  it('sorts A–Z and Z–A', () => {
    expect(sortTitles(titles, 'az').map((t) => t.title)).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(sortTitles(titles, 'za').map((t) => t.title)).toEqual(['Charlie', 'Bravo', 'Alpha']);
  });

  it('sorts by newest and oldest', () => {
    expect(sortTitles(titles, 'newest').map((t) => t.releaseYear)).toEqual([2020, 2010, 2000]);
    expect(sortTitles(titles, 'oldest').map((t) => t.releaseYear)).toEqual([2000, 2010, 2020]);
  });

  it('sorts by rating', () => {
    expect(sortTitles(titles, 'rating').map((t) => t.voteAverage)).toEqual([9, 7, 6]);
  });

  it('does not mutate the input array', () => {
    const original = [...titles];
    sortTitles(titles, 'az');
    expect(titles).toEqual(original);
  });
});
