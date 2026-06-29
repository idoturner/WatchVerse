import { describe, expect, it } from 'vitest';
import { mapMovieDetail, mapTvDetail } from './tmdb.mappers';

describe('mapMovieDetail', () => {
  it('maps a full movie detail including director, trailer, cast, and similar', () => {
    const detail = mapMovieDetail({
      id: 1,
      title: 'Dune',
      overview: 'Spice.',
      poster_path: '/p.jpg',
      backdrop_path: '/b.jpg',
      release_date: '2021-10-22',
      runtime: 155,
      vote_average: 8.1,
      tagline: 'Destiny awaits.',
      genres: [{ id: 878, name: 'Science Fiction' }],
      credits: {
        cast: [{ id: 11, name: 'Timothée Chalamet', character: 'Paul', profile_path: '/tc.jpg' }],
        crew: [
          { id: 22, name: 'Denis Villeneuve', job: 'Director' },
          { id: 23, name: 'Someone Else', job: 'Producer' },
        ],
      },
      videos: {
        results: [
          { key: 'teaser1', site: 'YouTube', type: 'Teaser', name: 'Teaser' },
          { key: 'trailer1', site: 'YouTube', type: 'Trailer', name: 'Trailer', official: true },
        ],
      },
      similar: { page: 1, results: [{ id: 3, title: 'Arrival' }] },
    });

    expect(detail.title).toBe('Dune');
    expect(detail.runtimeMinutes).toBe(155);
    expect(detail.directors).toEqual(['Denis Villeneuve']);
    expect(detail.trailer?.key).toBe('trailer1'); // official trailer preferred over teaser
    expect(detail.cast).toHaveLength(1);
    expect(detail.similar[0]?.title).toBe('Arrival');
  });

  it('handles a minimal movie detail with missing fields', () => {
    const detail = mapMovieDetail({ id: 2, genres: [] });
    expect(detail.title).toBe('Untitled');
    expect(detail.overview).toBe('');
    expect(detail.runtimeMinutes).toBeNull();
    expect(detail.trailer).toBeNull();
    expect(detail.cast).toEqual([]);
    expect(detail.directors).toEqual([]);
    expect(detail.similar).toEqual([]);
  });
});

describe('mapTvDetail', () => {
  it('maps creators as directors and uses episode runtime', () => {
    const detail = mapTvDetail({
      id: 5,
      name: 'Severance',
      first_air_date: '2022-02-18',
      episode_run_time: [50],
      genres: [],
      created_by: [{ id: 1, name: 'Dan Erickson' }],
    });
    expect(detail.title).toBe('Severance');
    expect(detail.mediaType).toBe('tv');
    expect(detail.releaseYear).toBe(2022);
    expect(detail.runtimeMinutes).toBe(50);
    expect(detail.directors).toEqual(['Dan Erickson']);
  });

  it('maps and sorts seasons', () => {
    const detail = mapTvDetail({
      id: 5,
      name: 'X',
      genres: [],
      seasons: [
        { season_number: 2, name: 'Season 2', episode_count: 10 },
        { season_number: 1, name: 'Season 1', episode_count: 9 },
      ],
    });
    expect(detail.seasons.map((s) => s.seasonNumber)).toEqual([1, 2]);
    expect(detail.seasons[0]?.episodeCount).toBe(9);
  });

  it('gives movie details no seasons', () => {
    expect(mapMovieDetail({ id: 2, genres: [] }).seasons).toEqual([]);
  });
});
