import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import { filterDisplayableTitles } from '@/domain/contentQuality';
import type { MediaType, SortKey, TmdbTitle } from '@/domain/types';
import { filterTitles, sortTitles } from '@/features/discover/filtering';
import { mapListItemToTitle } from '../tmdb.mappers';
import { TmdbListResponseSchema } from '../tmdb.schemas';
import { tmdbFetch } from '../tmdbClient';

export interface DiscoverTitlesParams {
  mediaType: MediaType;
  query: string;
  genreId: number | null;
  year: number | null;
  sortKey: SortKey;
}

interface DiscoverPage {
  titles: TmdbTitle[];
  page: number;
  totalPages: number;
}

function toTmdbSort(sortKey: SortKey, mediaType: MediaType): string {
  switch (sortKey) {
    case 'newest':
      return mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
    case 'oldest':
      return mediaType === 'movie' ? 'primary_release_date.asc' : 'first_air_date.asc';
    case 'rating':
      return 'vote_average.desc';
    case 'az':
      return mediaType === 'movie' ? 'original_title.asc' : 'popularity.desc';
    case 'za':
      return mediaType === 'movie' ? 'original_title.desc' : 'popularity.desc';
    case 'popular':
    default:
      return 'popularity.desc';
  }
}

/**
 * Server-side relevance floor (TMDB `vote_count.gte`) for default browsing. This is what
 * keeps Discover from reading like a raw database dump: event recordings, obscure shorts,
 * and unverified entries almost always sit below these vote counts. Tunable.
 */
export const DISCOVER_VOTE_FLOOR = {
  /** Relevance-oriented browse (Popular / Top-rated / A–Z / Oldest): a recognizable title. */
  relevance: 100,
  /** "Newest": lower, so genuinely new releases (few votes yet) still appear. */
  recent: 20,
} as const;

function yearParam(params: DiscoverTitlesParams): Record<string, number | undefined> {
  if (params.year === null) return {};
  return params.mediaType === 'movie'
    ? { primary_release_year: params.year }
    : { first_air_date_year: params.year };
}

/**
 * Build the TMDB `/discover` query params for browse mode. Pure + testable.
 *
 * Relevance-oriented by design (the default sort is "Popular", not "Newest"):
 * - every browse sort applies a `vote_count.gte` relevance floor (see DISCOVER_VOTE_FLOOR)
 *   so the grid reads like a polished app, not raw database output (events/shorts/unverified
 *   records sit below the floor);
 * - "Newest" additionally caps the release date at today, so future-dated placeholder
 *   records never lead, and uses a lower floor so genuinely new releases still surface.
 *
 * The client then applies a MODERATE display filter (poster *or* backdrop) — Home rails are
 * stricter (poster required); direct search is permissive (no filtering).
 */
export function buildDiscoverParams(
  params: DiscoverTitlesParams,
  pageParam: number,
  now: Date = new Date(),
): Record<string, string | number | undefined> {
  const out: Record<string, string | number | undefined> = {
    page: pageParam,
    sort_by: toTmdbSort(params.sortKey, params.mediaType),
    with_genres: params.genreId ?? undefined,
    include_adult: 'false',
    ...yearParam(params),
  };

  // Relevance floor: keep the grid recognizable, not raw database output. "Newest" gets a
  // lower floor so brand-new releases (few votes yet) still surface.
  out['vote_count.gte'] =
    params.sortKey === 'newest' ? DISCOVER_VOTE_FLOOR.recent : DISCOVER_VOTE_FLOOR.relevance;

  // "Newest" must mean newest *released* — cap at today so future placeholders don't lead.
  if (params.sortKey === 'newest') {
    const today = now.toISOString().slice(0, 10);
    out[params.mediaType === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte'] = today;
  }
  return out;
}

/**
 * Browse/search titles with infinite pagination. With a text query it uses TMDB
 * search (genre/year/sort applied client-side, since search ignores them); without
 * a query it uses TMDB discover (genre/year/sort applied server-side).
 */
export function useDiscoverTitles(params: DiscoverTitlesParams) {
  const isSearch = params.query.trim().length > 0;

  return useInfiniteQuery({
    queryKey: queryKeys.discover(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<DiscoverPage> => {
      const raw = isSearch
        ? await tmdbFetch(`/search/${params.mediaType}`, {
            query: params.query,
            page: pageParam,
            include_adult: 'false',
          })
        : await tmdbFetch(`/discover/${params.mediaType}`, buildDiscoverParams(params, pageParam));

      const parsed = TmdbListResponseSchema.parse(raw);
      let titles = parsed.results
        .filter((item) => item.media_type === undefined || item.media_type === params.mediaType)
        .map((item) => mapListItemToTitle(item, params.mediaType));

      if (isSearch) {
        // Search is intent-explicit — stay permissive (no display-quality filtering).
        titles = sortTitles(
          filterTitles(titles, { genreId: params.genreId, year: params.year }),
          params.sortKey,
        );
      } else {
        // Discover browse is broader than Home: a MODERATE filter that accepts a poster
        // OR a backdrop (vs. Home's poster-only), so the grid stays populated while still
        // dropping art-less / far-future placeholder records.
        titles = filterDisplayableTitles(titles, { requirePoster: false });
      }

      return { titles, page: parsed.page, totalPages: parsed.total_pages ?? parsed.page };
    },
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
}
