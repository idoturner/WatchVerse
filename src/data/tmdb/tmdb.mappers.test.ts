import { describe, expect, it } from 'vitest';
import { mapListItemToTitle } from './tmdb.mappers';

describe('mapListItemToTitle', () => {
  it('maps a movie list item', () => {
    const title = mapListItemToTitle(
      {
        id: 5,
        title: 'Dune',
        release_date: '2021-10-22',
        poster_path: '/p.jpg',
        vote_average: 8,
        overview: 'Spice.',
        genre_ids: [878, 12],
      },
      'movie',
    );
    expect(title).toEqual({
      tmdbId: 5,
      mediaType: 'movie',
      title: 'Dune',
      overview: 'Spice.',
      posterPath: '/p.jpg',
      backdropPath: null,
      releaseYear: 2021,
      releaseDate: '2021-10-22',
      voteAverage: 8,
      genreIds: [878, 12],
    });
  });

  it('falls back to name and first_air_date for tv', () => {
    const title = mapListItemToTitle(
      { id: 9, name: 'Severance', first_air_date: '2022-02-18' },
      'tv',
    );
    expect(title.title).toBe('Severance');
    expect(title.releaseYear).toBe(2022);
    expect(title.releaseDate).toBe('2022-02-18');
    expect(title.mediaType).toBe('tv');
  });

  it('prefers an explicit media_type over the fallback', () => {
    const title = mapListItemToTitle({ id: 1, media_type: 'tv', name: 'X' }, 'movie');
    expect(title.mediaType).toBe('tv');
  });

  it('handles a missing title, date, and genres gracefully', () => {
    const title = mapListItemToTitle({ id: 7 }, 'movie');
    expect(title.title).toBe('Untitled');
    expect(title.releaseYear).toBeNull();
    expect(title.releaseDate).toBeNull();
    expect(title.genreIds).toEqual([]);
  });
});
