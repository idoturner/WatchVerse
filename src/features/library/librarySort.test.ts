import { describe, expect, it } from 'vitest';
import { createLibraryEntry } from '@/domain/library';
import type { LibraryEntry, WatchStatus } from '@/domain/types';
import { filterEntriesByStatus, sortEntries } from './librarySort';

function entry(opts: {
  title?: string;
  year?: number | null;
  status?: WatchStatus;
  rating?: number | null;
  createdAt?: string;
}): LibraryEntry {
  const base = createLibraryEntry({
    tmdbId: Math.floor(Math.random() * 1e6),
    mediaType: 'movie',
    snapshot: { title: opts.title ?? 'Title', posterPath: null, releaseYear: opts.year ?? 2000 },
  });
  return {
    ...base,
    status: opts.status ?? base.status,
    rating: opts.rating ?? null,
    createdAt: opts.createdAt ?? base.createdAt,
  };
}

describe('filterEntriesByStatus', () => {
  const entries = [entry({ status: 'watching' }), entry({ status: 'completed' })];
  it('returns all for "all"', () => {
    expect(filterEntriesByStatus(entries, 'all')).toHaveLength(2);
  });
  it('filters to a single status', () => {
    expect(filterEntriesByStatus(entries, 'completed')).toHaveLength(1);
  });
});

describe('sortEntries', () => {
  it('sorts A–Z and Z–A by title', () => {
    const entries = [entry({ title: 'Zebra' }), entry({ title: 'Apple' })];
    expect(sortEntries(entries, 'az').map((e) => e.snapshot.title)).toEqual(['Apple', 'Zebra']);
    expect(sortEntries(entries, 'za').map((e) => e.snapshot.title)).toEqual(['Zebra', 'Apple']);
  });

  it('sorts by rating (highest first, unrated last)', () => {
    const entries = [
      entry({ title: 'low', rating: 4 }),
      entry({ title: 'none', rating: null }),
      entry({ title: 'high', rating: 9 }),
    ];
    expect(sortEntries(entries, 'rating').map((e) => e.snapshot.title)).toEqual([
      'high',
      'low',
      'none',
    ]);
  });

  it('sorts by date added (most recent first)', () => {
    const entries = [
      entry({ title: 'older', createdAt: '2020-01-01T00:00:00.000Z' }),
      entry({ title: 'newer', createdAt: '2021-01-01T00:00:00.000Z' }),
    ];
    expect(sortEntries(entries, 'date_added').map((e) => e.snapshot.title)).toEqual([
      'newer',
      'older',
    ]);
  });
});
