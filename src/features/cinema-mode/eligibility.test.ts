import { describe, expect, it } from 'vitest';
import { createLibraryEntry } from '@/domain/library';
import type { LibraryEntry, MediaType, TitleSnapshot, WatchStatus } from '@/domain/types';
import { defaultCinemaType, eligibleCandidates, isReleased } from './eligibility';

const NOW = new Date('2026-06-29T00:00:00.000Z');

const snap = (over: Partial<TitleSnapshot> = {}): TitleSnapshot => ({
  title: 'T',
  posterPath: null,
  releaseYear: 2020,
  ...over,
});

function make(opts: {
  id: number;
  mediaType?: MediaType;
  status?: WatchStatus;
  releaseYear?: number | null;
  releaseDate?: string | null;
}): LibraryEntry {
  const base = createLibraryEntry({
    tmdbId: opts.id,
    mediaType: opts.mediaType ?? 'movie',
    snapshot: snap({ releaseYear: opts.releaseYear ?? 2020, releaseDate: opts.releaseDate ?? null }),
  });
  return { ...base, status: opts.status ?? 'want' };
}

describe('isReleased', () => {
  it('excludes a known future release date', () => {
    expect(isReleased(snap({ releaseDate: '2031-12-17', releaseYear: 2031 }), NOW)).toBe(false);
  });
  it('includes a past release date', () => {
    expect(isReleased(snap({ releaseDate: '2020-01-01' }), NOW)).toBe(true);
  });
  it('falls back to release year when no date — future year excluded', () => {
    expect(isReleased(snap({ releaseYear: 2031 }), NOW)).toBe(false);
  });
  it('treats the current year (no date) as released', () => {
    expect(isReleased(snap({ releaseYear: 2026 }), NOW)).toBe(true);
  });
  it('treats missing date and year as released (unknown is never auto-excluded)', () => {
    expect(isReleased(snap({ releaseYear: null }), NOW)).toBe(true);
    expect(isReleased(snap({ releaseYear: null, releaseDate: null }), NOW)).toBe(true);
  });
});

describe('eligibleCandidates', () => {
  it('includes only Want-to-Watch, released titles of the chosen type', () => {
    const entries = [
      make({ id: 1, mediaType: 'movie', status: 'want', releaseYear: 2020 }), // eligible
      make({ id: 2, mediaType: 'movie', status: 'watching', releaseYear: 2020 }), // not eligible
      make({ id: 3, mediaType: 'movie', status: 'completed', releaseYear: 2020 }), // not eligible
      make({ id: 4, mediaType: 'movie', status: 'on_hold', releaseYear: 2020 }), // not eligible
      make({ id: 5, mediaType: 'movie', status: 'dropped', releaseYear: 2020 }), // not eligible
      make({ id: 6, mediaType: 'movie', status: 'want', releaseYear: 2031, releaseDate: '2031-01-01' }), // future
      make({ id: 7, mediaType: 'tv', status: 'want', releaseYear: 2019 }), // eligible tv
      make({ id: 8, mediaType: 'tv', status: 'watching', releaseYear: 2019 }), // not eligible
    ];
    expect(eligibleCandidates(entries, 'movie', NOW).map((e) => e.tmdbId)).toEqual([1]);
    expect(eligibleCandidates(entries, 'tv', NOW).map((e) => e.tmdbId)).toEqual([7]);
  });

  it('keeps a Want-to-Watch title with unknown release date/year', () => {
    const e = make({ id: 1, status: 'want', releaseYear: null, releaseDate: null });
    expect(eligibleCandidates([e], 'movie', NOW).map((x) => x.tmdbId)).toEqual([1]);
  });
});

describe('defaultCinemaType', () => {
  it('defaults to movie when an eligible movie exists', () => {
    const entries = [make({ id: 1, mediaType: 'movie' }), make({ id: 2, mediaType: 'tv' })];
    expect(defaultCinemaType(entries, NOW)).toBe('movie');
  });
  it('falls back to tv when only tv is eligible', () => {
    const entries = [
      make({ id: 1, mediaType: 'movie', releaseYear: 2031, releaseDate: '2031-01-01' }),
      make({ id: 2, mediaType: 'tv', releaseYear: 2019 }),
    ];
    expect(defaultCinemaType(entries, NOW)).toBe('tv');
  });
  it('defaults to movie when nothing is eligible', () => {
    expect(defaultCinemaType([], NOW)).toBe('movie');
  });
});
