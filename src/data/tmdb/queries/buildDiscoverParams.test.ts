import { describe, expect, it } from 'vitest';
import {
  buildDiscoverParams,
  DISCOVER_VOTE_FLOOR,
  type DiscoverTitlesParams,
} from './useDiscoverTitles';

const NOW = new Date('2026-06-29T00:00:00.000Z');
const base: DiscoverTitlesParams = {
  query: '',
  mediaType: 'movie',
  genreId: null,
  year: null,
  sortKey: 'popular', // the default browse sort
};

describe('buildDiscoverParams', () => {
  it('default browse uses Popular (relevance) with a vote floor and no date cap', () => {
    const params = buildDiscoverParams(base, 1, NOW);
    expect(params.sort_by).toBe('popularity.desc');
    expect(params['vote_count.gte']).toBe(DISCOVER_VOTE_FLOOR.relevance);
    expect(params['primary_release_date.lte']).toBeUndefined();
  });

  it('Top rated keeps the relevance floor (avoids 1-vote 10/10 junk)', () => {
    const params = buildDiscoverParams({ ...base, sortKey: 'rating' }, 1, NOW);
    expect(params.sort_by).toBe('vote_average.desc');
    expect(params['vote_count.gte']).toBe(DISCOVER_VOTE_FLOOR.relevance);
  });

  it('Newest movie caps at today and uses the lower recent floor', () => {
    const params = buildDiscoverParams({ ...base, sortKey: 'newest' }, 1, NOW);
    expect(params.sort_by).toBe('primary_release_date.desc');
    expect(params['primary_release_date.lte']).toBe('2026-06-29');
    expect(params['vote_count.gte']).toBe(DISCOVER_VOTE_FLOOR.recent);
  });

  it('Newest TV caps first_air_date at today', () => {
    const params = buildDiscoverParams({ ...base, mediaType: 'tv', sortKey: 'newest' }, 1, NOW);
    expect(params['first_air_date.lte']).toBe('2026-06-29');
    expect(params['primary_release_date.lte']).toBeUndefined();
    expect(params['vote_count.gte']).toBe(DISCOVER_VOTE_FLOOR.recent);
  });

  it('Oldest uses the relevance floor (surfaces recognizable classics, not obscure shorts)', () => {
    const params = buildDiscoverParams({ ...base, sortKey: 'oldest' }, 1, NOW);
    expect(params.sort_by).toBe('primary_release_date.asc');
    expect(params['vote_count.gte']).toBe(DISCOVER_VOTE_FLOOR.relevance);
    expect(params['primary_release_date.lte']).toBeUndefined();
  });

  it('omits genre/year when browsing broadly (All genres / All years)', () => {
    const params = buildDiscoverParams(base, 1, NOW);
    expect(params.with_genres).toBeUndefined();
    expect(params.primary_release_year).toBeUndefined();
    expect(params.include_adult).toBe('false');
  });

  it('passes genre and year through when set', () => {
    const params = buildDiscoverParams({ ...base, genreId: 28, year: 2020 }, 2, NOW);
    expect(params.with_genres).toBe(28);
    expect(params.primary_release_year).toBe(2020);
    expect(params.page).toBe(2);
  });
});
