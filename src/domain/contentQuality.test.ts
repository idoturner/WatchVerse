import { describe, expect, it } from 'vitest';
import { filterDisplayableTitles, isDisplayableTitle } from './contentQuality';
import type { TmdbTitle } from './types';

// Fixed reference date so the 18-month window is deterministic. Window end ≈ 2027-12-28.
const NOW = new Date('2026-06-28T00:00:00.000Z');

function title(over: Partial<TmdbTitle> = {}): TmdbTitle {
  return {
    tmdbId: 1,
    mediaType: 'movie',
    title: 'A Movie',
    overview: '',
    posterPath: '/p.jpg',
    backdropPath: '/b.jpg',
    releaseYear: 2024,
    releaseDate: '2024-01-01',
    voteAverage: 7,
    genreIds: [],
    ...over,
  };
}

describe('isDisplayableTitle', () => {
  it('keeps a well-formed, released title', () => {
    expect(isDisplayableTitle(title(), { now: NOW })).toBe(true);
  });

  it('excludes a poster-less title on poster-first surfaces', () => {
    expect(isDisplayableTitle(title({ posterPath: null }), { now: NOW })).toBe(false);
  });

  it('requires poster OR backdrop when requirePoster is false', () => {
    expect(
      isDisplayableTitle(title({ posterPath: null, backdropPath: null }), {
        now: NOW,
        requirePoster: false,
      }),
    ).toBe(false);
    expect(
      isDisplayableTitle(title({ posterPath: null }), { now: NOW, requirePoster: false }),
    ).toBe(true);
  });

  it('excludes placeholder records with no usable title', () => {
    expect(isDisplayableTitle(title({ title: 'Untitled' }), { now: NOW })).toBe(false);
    expect(isDisplayableTitle(title({ title: '   ' }), { now: NOW })).toBe(false);
  });

  it('excludes a movie releasing absurdly far in the future', () => {
    // e.g. "Avatar 5" (2031), "100 Years" (2099)
    expect(
      isDisplayableTitle(title({ releaseDate: '2031-12-17', releaseYear: 2031 }), { now: NOW }),
    ).toBe(false);
    expect(
      isDisplayableTitle(title({ releaseDate: '2099-01-01', releaseYear: 2099 }), { now: NOW }),
    ).toBe(false);
  });

  it('keeps a genuine upcoming movie inside the ~18-month window', () => {
    expect(
      isDisplayableTitle(title({ releaseDate: '2027-03-01', releaseYear: 2027 }), { now: NOW }),
    ).toBe(true);
  });

  it('does not apply the movie far-future rule to TV', () => {
    expect(
      isDisplayableTitle(title({ mediaType: 'tv', releaseDate: '2031-01-01', releaseYear: 2031 }), {
        now: NOW,
      }),
    ).toBe(true);
  });

  it('treats an unknown release date as not-far-future (artwork still required)', () => {
    expect(isDisplayableTitle(title({ releaseDate: null }), { now: NOW })).toBe(true);
    expect(isDisplayableTitle(title({ releaseDate: null, posterPath: null }), { now: NOW })).toBe(
      false,
    );
  });
});

describe('surface filtering policy (strict Home vs moderate Discover)', () => {
  const backdropOnly = title({ posterPath: null, backdropPath: '/b.jpg' });

  it('Home rails are strict — a backdrop-only title is dropped (poster required)', () => {
    expect(isDisplayableTitle(backdropOnly, { now: NOW })).toBe(false);
  });

  it('Discover browse is moderate — a backdrop-only title is kept', () => {
    expect(isDisplayableTitle(backdropOnly, { now: NOW, requirePoster: false })).toBe(true);
  });

  it('both surfaces still drop art-less and far-future records', () => {
    const artless = title({ posterPath: null, backdropPath: null });
    const farFuture = title({ releaseDate: '2031-01-01', releaseYear: 2031 });
    for (const opts of [{ now: NOW }, { now: NOW, requirePoster: false }]) {
      expect(isDisplayableTitle(artless, opts)).toBe(false);
      expect(isDisplayableTitle(farFuture, opts)).toBe(false);
    }
  });
});

describe('filterDisplayableTitles', () => {
  it('drops placeholder/far-future records and keeps valid ones (incl. future TV)', () => {
    const list = [
      title({ tmdbId: 1 }), // valid
      title({ tmdbId: 2, posterPath: null }), // no poster
      title({ tmdbId: 3, releaseDate: '2031-01-01', releaseYear: 2031 }), // far-future movie
      title({ tmdbId: 4, mediaType: 'tv', releaseDate: '2030-01-01', releaseYear: 2030 }), // future TV, has poster
    ];
    expect(filterDisplayableTitles(list, { now: NOW }).map((t) => t.tmdbId)).toEqual([1, 4]);
  });
});
